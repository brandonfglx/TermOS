import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { File, Directory, fileSystem } from "$lib/components/FileSystem.svelte";
import InputDialog from "$lib/utils/InputDialog.svelte";
import InfoDialog from "$lib/utils/InfoDialog.svelte";
import ErrorDialog from "$lib/utils/ErrorDialog.svelte";

class FilesApp implements Command, Application {
	public name: string = "files";
	public desc: string = "access files in a virtual file system and save it in LocalStorage";
	public evalOnLoad: string[] = [
		"alias ls files ls",
		"alias touch files touch",
		"alias rm files rm",
		"alias mv files mv",
		"alias cat files cat",
		"alias mkdir files mkdir",
		"alias cd files cd",
		"alias pwd files pwd",
		"alias save files save",
		"alias load files load",
	];

	private cwd: Directory = $state(fileSystem.root);
	private history: Directory[] = $state([]);
	private historyIndex: number = 0;

	public readonly EL_PER_LINE = 6;

	// Application properties
	public back: SVGSVGElement | undefined;
	public forward: SVGSVGElement | undefined;
	public input: HTMLInputElement | undefined = $state(undefined);
	public searchedDir: Directory | null = $state(null);
	public navPath: string = $state(""); // Represents the user's input; will be overriden if truePath points to a valid directory

	// Dialogs
	public inputDialog = $state<ReturnType<typeof InputDialog> | null>(null);
	public infoDialog = $state<ReturnType<typeof InfoDialog> | null>(null);
	public errorDialog = $state<ReturnType<typeof ErrorDialog> | null>(null);

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [action] [...args]`,
			"\tArgs:",
			"\t\taction: action to perform",
			"\t\t\tNo argument:",
			"\t\t\t\tpwd - prints the path of the current working directory",
			"\t\t\tRequires path:",
			"\t\t\t\ttouch: create a file",
			"\t\t\t\trm: remove a file",
			"\t\t\t\tmv: move a file or directory (use -d to favor directory over files if there is overlap)",
			"\t\t\t\tcat: prints a file's contents",
			"\t\t\t\tmkdir: create a directory",
			"\t\t\t\tcd: change directory",
			"\t\t\tIf no action is provided, lists all files and directories in the current working directory.",
			`\t\targs: arguments for the action (list of available args can be found with \"help ${this.name} [action]\")`
		];
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		if (args.length === 0) {
			return map;
		}

		map.set("action", args[0]);

		if (args.length < 2) {
			return map;
		}

		let currFlag = "";
		let currVal = "";

		let rem = args.slice(1);
		for (let i = 0; i < rem.length; i++) {
			if (rem[i].startsWith("-")) {
				if (currFlag.length !== 0) {
					map.set(currFlag, currVal);
				}

				currFlag = rem[i];
				currVal = "";
			} else {
				if (currVal.length === 0) {
					currVal = rem[i];
				} else {
					currVal += ` ${rem[i]}`;
				}
			}
		}

		// NOTE: Since there is ambiguity on a flag and the "etc" values, the currVal is only kept to the flag if the flag needs a value
		if (currFlag.length !== 0 && this.needsValue(currFlag)) {
			map.set(currFlag, currVal);
		} else {
			if (currFlag.length !== 0) {
				map.set(currFlag, "");
			}

			map.set("etc", currVal);
		}

		return map;
	}
 
	// Allow users to create files using `files create [name].[ext]` or delete using `files delete [name].txt` -> create aliases for `touch [name].[ext]` and `rm [name].[ext]`
	public execute(args: Map<string, string>): void {
		if (args.size === 0) {
			desktop.switchTo(this);
			return;
		}

		let action = args.get("action") ?? "";

		// No path/"etc" value needed
		switch (action) {
			case "ls":
				this.ls(args.get("etc"), args);
				return;
			case "pwd":
				this.pwd();
				return;
		}

		// Needs "etc" value
		let remArgs = new Map(args);
		remArgs.delete("etc");

		let etc = args.get("etc");
		if (!etc) {
			this.errorDialog?.error({
				title: "files",
				content: "missing path"
			})
			return;
		}

		// Calls appropriate action
		switch (action) {
			case "touch":
				let succeededTouch = this.touch(etc, remArgs);
				if (!succeededTouch) {
					this.errorDialog?.error({
						title: "files touch:",
						content: `failed to create file: ${etc}`
					});
					return;
				}
				break;
			case "rm":
				let succeededRm = this.rm(etc, remArgs);
				if (!succeededRm) {
					this.errorDialog?.error({
						title: "files rm:",
						content: `failed to remove: ${etc}`
					});
					return;
				}
				break;
			case "mv":
				let succeededMv = this.mv(etc, remArgs);
				if (!succeededMv) {
					this.errorDialog?.error({
						title: "files mv:",
						content: `failed to move: ${etc}`
					});
					return;
				}
				break;
			case "cat":
				this.cat(etc, remArgs);
				break;
			case "mkdir":
				let succeededMkdir = this.mkdir(etc, remArgs);
				if (!succeededMkdir) {
					this.errorDialog?.error({
						title: "files mkdir:",
						content: `failed to create directory: ${etc}`
					});
					return;
				}
				break;
			case "cd":
				let succeededCd = this.cd(etc, remArgs);
				if (!succeededCd) {
					this.errorDialog?.error({
						title: "files cd:",
						content: `failed to change directory: ${etc}`
					});
					return;
				}
				break;
			case "save":
				this.save();
				break;
			case "load":
				this.load();
				break;
			default:
				this.errorDialog?.error({
					title: "files:",
					content: `invalid action: ${args.get("action")}`
				});
				break;
		}
	}

	// Saves the entire root directory to LocalStorage; returns true if succeeded, false otherwise
	public save(): void {
		try {
			fileSystem.save();
		} catch {
			this.errorDialog?.error({
				title: "files save:",
				content: "Exceeded maximum localStorage capacity. Data was not saved!"
			});
		}
	}

	// Loads the entire root directory from LocalStorage; returns true if succeeded, false otherwise
	public load(): void {
		let result = fileSystem.load();
		if (!result) {
			this.errorDialog?.error({
				title: "files load:",
				content: "cannot load root from localStorage"
			});
			return;
		}

		this.cwd = fileSystem.root;
		this.onAppShow(); // Reset the state of FilesApp when reloading from localStorage (even though its not an app reload)
	}

	public ls(path: string | undefined, args: Map<string, string>): void {
		let arr: (Directory | File)[];
		if (!path) {
			arr = this.cwd.getAll();
		} else {
			let dir = this.find(path, "d");
			if (!dir) {
				return;
			}

			arr = dir.getAll();
		}

		if (arr.length === 0) {
			return;
		}

		let maxLength = arr.toSorted((a, b) => b.name.length - a.name.length)[0].name.length;

		// Process in batches
		for (let i = 0; i < Math.floor(arr.length / this.EL_PER_LINE); i++) {
			let line = "";

			for (let j = i; j < this.EL_PER_LINE; j++) {
				line += arr[j].name.padEnd(maxLength + 1);
			}

			terminal.printf(line, {});
		}

		// Add the remaining elements (final line)
		let rest = "";
		for (let i = arr.length - arr.length % this.EL_PER_LINE; i < arr.length; i++) {
			rest += arr[i].name.padEnd(maxLength + 1);
		}
		terminal.printf(rest, {});
	}

	// TODO: Allow touch to create intermediary directories
	public touch(path: string, args: Map<string, string>): File | null {
		let dir = this.cwd;

		if (path.indexOf("/") !== -1) {
			let tempDir = this.findParent(path);
			if (tempDir == null) {
				return null;
			}
			dir = tempDir;
		}
		
		let name = this.extractName(path);
		let attempt = dir.createFile(name);

		if (attempt == null && args.has("--force")) {
			if (dir.removeFile(name)) {
				return dir.createFile(name);
			}

			return null;
		}

		return attempt;
	}

	// Removes the file (or directory when "-r" | "--recursive" is appended), searches both files and dirs, returns whether the rm succeded
	public rm(path: string, args: Map<string, string>): boolean {
		let parsed = this.parsePath(path);
		let name = this.extractName(parsed);

		let potDir = this.find(parsed, "d");
		let potFile = this.find(parsed, "f");

		// Always delete the file first, then try to delete directory
		if (potFile) {
			return potFile.removeFile(name);
		} else if (potDir) {
			if (args.has("-r") || args.has("--recursive")) {
				let parent = potDir.parent;
				if (!parent) {
					this.errorDialog?.error({
						title: "files rm:",
						content: "cannot delete directory with no parent"
					});
					return false;
				}

				return parent.removeDir(name);
			} else {
				this.errorDialog?.error({
					title: "files rm:",
					content: `cannot delete directory at "${parsed}" without -r`
				});
				return false;
			}
		} else {
			this.errorDialog?.error({
				title: "files rm:",
				content: `could not find item at ${parsed}`
			});
			return false;
		}
	}

	// TODO: Allow mv to rename files (move to same directory)
	public mv(path: string, args: Map<string, string>): Directory | null {
		let [target, dest] = path.split(/\s+/).filter(x => x.length > 0);
		if (!target || !dest) {
			return null;
		}

		let [targetDir, targetFile] = this.findAny(target);
		let newName = targetDir?.name ?? targetFile?.name ?? "";
		let destDir = this.find(dest, "d");
		if (!destDir) {
			let valid = this.findValidParent(dest);
			if (!valid) {
				return null; // No viable parent found
			}

			let parent = valid[0];
			let rem = valid[1];
			let destName = rem.substring(Math.max(0, rem.lastIndexOf("/") + 1));

			// Create intermediary directories
			if (rem.indexOf("/") > -1) {
				if (!args.has("-r") && !args.has("--recursive")) {
					return null;
				}

				// Create all remaining directories
				for (let name of rem.substring(0, rem.length - destName.length - 1).split("/")) {
					let dir = parent.createDir(name);
					if (!dir) {
						return null;
					}

					parent = dir;
				}
			}

			destDir = parent;
			newName = destName;
		}

		// Prioritize file mv over dir mv (except for when it has "-d")
		if (args.has("-d") || !targetFile) {
			if (!targetDir?.parent) {
				return null;
			}

			return targetDir.parent.move(targetDir, destDir, newName) ? destDir : null;
		}

		return targetFile.parent.move(targetFile, destDir, newName) ? destDir : null;
	}

	public cat(path: string, args: Map<string, string>): void {
		let parsed = this.parsePath(path);
		let file = this.find(parsed, "f")?.getFile(this.extractName(parsed));
		if (!file) {
			this.errorDialog?.error({
				title: "files cat:",
				content: `invalid file: ${path}`
			});
			return;
		}

		terminal.println(file.getContent());
		
		// Update metadata
		file.metadata.dateAccessed = file.metadata.now();
	}

	public mkdir(path: string, args: Map<string, string>): Directory | null {
		let parsed = this.parsePath(path);
		let valid = this.findValidParent(parsed);
		if (!valid) {
			return null;
		}

		// Create all remaining directories
		let dir = valid[0];
		let rem = valid[1].split("/").filter(x => x.length > 0);

		if (rem.length === 0) {
			return null; // None created
		}

		// Create directory if there is the only one & don't ask for -r
		if (rem.length === 1) {
			return dir.createDir(rem[0]);
		}

		// Ask for -r permission, then create dir
		if (!args.has("-r") && !args.has("--recursive")) {
			this.errorDialog?.error({
				title: "files mkdir:",
				content: "creating nested directories needs -r"
			});
			return null;
		}

		for (let next of rem) {
			let nextDir = dir.createDir(next);
			if (nextDir) {
				dir = nextDir;
			}
		}

		return dir;
	}

	public cd(path: string, args: Map<string, string>): Directory | null {
		let parsed = this.parsePath(path);

		// Return "error" if path points to a file
		if (this.find(parsed, "f") !== null) {
			return null;
		}

		// Move to path if possiple
		let dir = this.find(parsed, "d");
		if (dir) {
			this.cwd = dir;
		}

		return dir;
	}

	public pwd(): void {
		terminal.println(this.cwd.getPath());
	}

	// Attempts to navigate back/forth using a history stack system
	public nav(delta: number): void {
		if (this.history.length === 0) {
			return;
		}

		this.historyIndex = Math.max(0, Math.min(this.historyIndex + delta, this.history.length - 1));
		let dir = this.history[this.historyIndex];
		if (!dir) {
			return;
		}

		this.searchedDir = dir;
		this.navPath = dir.getPath();
	}

	//  Sets the given path to the navPath and fetches new searchedDir
	public preview(path: string): void {
		this.navPath = path;
		this.searchedDir = this.resolveDir(path);
	}

	// Attempts to navigate to the given directory
	public go(): void {
		let dir = this.resolveDir(this.navPath);
		this.searchedDir = dir;
		if (dir) {
			this.commit(dir);
		}
	}

	// Attempts to find a Directory that matches the path; null otherwise
	private resolveDir(path: string): Directory | null {
		if (!path.trim()) {
			return this.cwd;
		}

		try {
			return this.find(this.parsePath(path), "d");
		} catch {
			return null;
		}
	}

	// Pushes the Directory into the history stack and makes it the "true" directory 
	private commit(dir: Directory): void {
		this.navPath = dir.getPath();

		// Do not add to history if already present
		if (this.history[this.historyIndex] === dir) {
			return;
		}

		this.history.splice(this.historyIndex + 1);
		this.history.push(dir);
		this.historyIndex = this.history.length - 1;
	}

	// Sets the current navPath to the target directory or opens up the file in the TextApp for file
	public open(index: number): void {
		if (!this.searchedDir) {
			this.errorDialog?.error({
				title: "files: open",
				content: "Invalid searchedDir"
			});
			return;
		}
		
		let item = this.searchedDir.getAll().at(index);
		if (!item) {
			this.errorDialog?.error({
				title: "files: open",
				content: `Invalid index: ${index}. Reload the app to update contents.`
			});
			return;
		}

		if (item instanceof Directory) { // Directory
			this.navPath = item.getPath();
			this.go();
		} else { // File
			terminal.executeCommand(`text ${item.getPath()}`);
		}
	}

	// Shows the information of a file or directory using InfoDialog
	public inspect(index: number): void {
		if (!this.infoDialog || !this.searchedDir) {
			return;
		}

		let item = this.searchedDir.getAll()[index];
		if (!item) {
			return;
		}

		this.infoDialog.log({
			title: item.name,
			content: JSON.stringify(item.metadata.toJSON(), null, 2)
		});
	}

	// Returns the correct directory (or parent directory of file) when user inputs a nested path (d = dir, f = file)
	public find(path: string, type: "d" | "f"): Directory | null {
		let dir = fileSystem.root;
		let pathArr = this.parsePath(path).split("/").filter(x => x.length > 0);

		if (pathArr.length === 0) {
			return type === "f" ? null : dir;
		}

		for (let i = 0; i < pathArr.length; i++) {
			if (i === pathArr.length - 1 && type === "f") {
				if (dir.hasFile(pathArr[i])) {
					return dir;
				}

				return null;
			} else {
				let next = dir.getDir(pathArr[i]);
				if (next === null) {
					return null;
				}

				dir = next;
			}
		}

		return dir;
	}

	// Finds all files and directories with the given path
	public findAny(path: string): [Directory | null, File | null] {
		let fileDir = this.find(path, "f");
		if (!fileDir) {
			return [this.find(path, "d"), null];
		}

		return [this.find(path, "d"), fileDir.getFile(this.extractName(path))];
	}

	// Parses the provided path, replacing relative file paths with absolute ones
	// NOTE: This method doesn't ensure path validity, yet...
	public parsePath(path: string): string {
		// Expand ~ to fs ropt
		if (path === "~" || path.startsWith("~/")) {
			path = fileSystem.root.getPath() + path.slice(1);
		}

		let parts = path.startsWith("/") ? [] : this.cwd.getPath().split("/").filter(x => x.length > 0);

		for (let seg of path.split("/")) {
			if (seg.length === 0 || seg === ".") {
				continue;
			}

			if (seg === "..") {
				parts.pop();
				continue;
			}

			parts.push(seg);
		}

		return fileSystem.root.getPath() + parts.join("/");
	}

	// Finds the parent of the specified dir or file, or null if the dir/file doesn't exist when parsing
	public findParent(path: string): Directory | null {
		let parentPath = path.substring(0, path.lastIndexOf("/"));
		if (parentPath.length === 0) {
			return fileSystem.root;
		}

		return this.find(parentPath, "d");
	}

	// Finds the parent of the specified dir or file as low in the directory tree as possible to the closest parent by walking upwards and retrying using find
	private findValidParent(path: string): [Directory, string] | null {
		path = this.parsePath(path);

		let split = path;
		let dir: Directory | null;
		do {
			dir = this.find(split, "d");
			split = split.substring(0, Math.max(0, split.lastIndexOf("/") + 1));
		} while (!dir && split.length > 0);

		if (!dir || split.length === 0) {
			return null;
		}

		return [dir, path.substring(split.length)];
	}

	// Extracts the name of the dir/file with this path.
	public extractName(path: string): string {
		let parsed = this.parsePath(path);
		return parsed.substring(parsed.lastIndexOf("/") + 1);
	}

	// Returns a string representing the bytes converted to its most convienient value
	public convertBytes(bytes: number): string {
		if (bytes >= 1000000000) {
			return `${(bytes / 1000000000).toFixed(2)} GB`
		} else if (bytes >= 1000000) {
			return `${(bytes / 1000000).toFixed(2)} MB`;
		} else if (bytes >= 1000) {
			return `${(bytes / 1000).toFixed(2)} kB`;
		}

		return `${bytes} bytes`;
	}

	public getCwd(): Directory {
		return this.cwd;
	}

	// Requires a value for flags, prevents ambiguity when parsing args
	private needsValue(flag: string): boolean {
		switch (flag) {
			default:
				return false;
		}
	}

	// Application handlers

	public async handleNewFolder(): Promise<void> {
		if (!this.inputDialog) {
			return;
		}

		if (!this.searchedDir) {
			await this.errorDialog?.error({
				title: "files: handleNewFolder",
				content: "searchedDir does not exist"
			});
			return;
		}

		let name = await this.inputDialog.ask({
			prompt: "New Folder Name:",
			placeholder: "New Folder"
		});

		if (!name) {
			return;
		}

		// Attempt to create it, otherwise throw error
		let result = this.searchedDir.createDir(name);
		if (!result) {
			await this.errorDialog?.error({
				title: "files: handleNewFolder",
				content: `Duplicate directory: ${name}`
			});
			return;
		}
	}

	public async handleNewFile(): Promise<void> {
		if (!this.inputDialog) {
			return;
		}

		if (!this.searchedDir) {
			await this.errorDialog?.error({
				title: "files: handleNewFile",
				content: "searchedDir does not exist"
			});
			return;
		}

		let name = await this.inputDialog.ask({
			prompt: "New File Name:",
			placeholder: "New File.txt"
		});

		if (!name) {
			return;
		}

		// Attempt to create it, otherwise throw error
		let result = this.searchedDir.createFile(name);
		if (!result) {
			await this.errorDialog?.error({
				title: "files: handleNewFile",
				content: `Duplicate file: ${name}`
			});
			return;
		}
	}

	public onAppShow(): void {
		// Set current reference directory to cwd
		this.searchedDir = this.cwd;
		this.navPath = this.searchedDir.getPath();
		this.history = [this.cwd];
		this.historyIndex = 0;
	}

	public onAppHide(): void {
		
	}

	// TODO: Add shortcut ctrl+n to create a new file and ctrl+shift+n to create directory (add respective buttons to left side of address bar)
	public keydown(event: KeyboardEvent): void {
		switch (event.key) {
			case "q":
			case "c":
				if (event.ctrlKey) {
					desktop.quit();
				}
				break;
			case "n":
				if (event.ctrlKey) {
					this.handleNewFile();
				}
				break;
			case "N":
				if (event.ctrlKey) {
					this.handleNewFolder();
				}
				break;
		}
	}

	public keyup(event: KeyboardEvent): void {
		
	}

	public paste(event: ClipboardEvent): void {
		
	}

	public onFocusGain(): void {
		
	}

	public onFocusLost(): void {
		
	}
}

export const app = new FilesApp();