import { type Application } from "$lib/components/listeners/Desktop.svelte";
import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { File, Directory, fileSystem } from "$lib/components/FileSystem.svelte";

class FilesApp implements Command, Application {
	public name: string = "files";
	public desc: string = "access files in a virtual file system and save it in LocalStorage";
	public evalOnLoad: string[] = [
		"alias ls files",
		"alias touch files touch",
		"alias rm files rm",
		"alias cat files cat",
		"alias mkdir files mkdir",
		"alias cd files cd",
		"alias pwd files pwd",
		"alias save files save",
		"alias load files load",
	];

	private cwd: Directory = fileSystem.root;

	public readonly EL_PER_LINE = 6;

	// Application properties
	public navPath: string = this.cwd.getPath();

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
		if (args.size === 0 && this.cwd.getAll().length > 0) {
			let arr = this.cwd.getAll();
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

			return;
		}

		let action = args.get("action") ?? "";

		// No path/"etc" value needed
		switch (action) {
			case "pwd":
				this.pwd();
				return;
		}

		// Needs "etc" value
		let remArgs = new Map(args);
		remArgs.delete("etc");

		let etc = args.get("etc");
		if (!etc) {
			throw new Error("files: missing path");
		}

		// Calls appropriate action
		switch (action) {
			case "touch":
				this.touch(etc, remArgs);
				break;
			case "rm":
				let succeded = this.rm(etc, remArgs);
				if (!succeded) {
					throw new Error(`files rm: failed to remove: ${etc}`);
				}
				break;
			case "cat":
				this.cat(etc, remArgs);
				break;
			case "mkdir":
				this.mkdir(etc, remArgs);
				break;
			case "cd":
				this.cd(etc, remArgs);
				break;
			case "save":
				this.save();
				break;
			case "load":
				this.load();
				break;
			default:
				throw new Error(`files: invalid action: ${args.get("action")}`);
		}
	}

	// Saves the entire root directory to LocalStorage; returns true if succeeded, false otherwise
	public save(): void {
		fileSystem.save();
	}

	// Loads the entire root directory from LocalStorage; returns true if succeeded, false otherwise
	public load(): void {
		let result = fileSystem.load();

		if (!result) {
			throw new Error("files: cannot load root from localStorage");
		}
	}

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
		if (path.indexOf("/") !== -1) {
			let dir = this.findParent(path);
			let name = this.extractName(path);

			if (dir == null) {
				return false;
			}

			// Tries files first since it doesn't require -r
			if (dir.hasFile(name)) {
				return dir.removeFile(name);
			} else if (dir.hasDir(name)) {
				if (args.has("-r") || args.has("--recursive")) {
					return dir.removeDir(name);
				} else {
					return false;
				}
			}

			return false;
		}

		let name = this.extractName(path);

		// Removing files/dirs one "step" from the cwd
		if (this.cwd.hasFile(name)) {
			return this.cwd.removeFile(name);
		} else if (this.cwd.hasDir(name)) {
			if (args.has("-r") || args.has("--recursive")) {
				return this.cwd.removeDir(name);
			} else {
				return false;
			}
		}

		return false;
	}

	public cat(path: string, args: Map<string, string>): void {
		let dir = this.cwd;
		if (path.indexOf("/") !== -1) {
			let found = this.find(path, "f");
			if (!found) {
				throw new Error(`files: invalid file: ${path}`);
			}

			dir = found;
		}

		let file = dir.getFile(this.extractName(path));
		if (!file) {
			throw new Error(`files: invalid file: ${path}`);
		}

		terminal.println(file.getContent());
		
		// Update metadata
		file.metadata.dateAccessed = file.metadata.now();
	}

	public mkdir(path: string, args: Map<string, string>): Directory | null {
		// Creating relative to current directory
		if (path.indexOf("/") === -1) {
			return this.cwd.createDir(path);
		}

		// Check whether the directory is being created from root
		let start = this.cwd;
		if (path.startsWith(fileSystem.root.name)) {
			start = fileSystem.root;
		}

		let name = this.extractName(path);

		// Recursively navigate until intended parent dir
		let potentialParent = this.findParent(path);
		if (potentialParent) {
			return potentialParent.createDir(name);
		}

		// Require user to acknowledge missing parent dirs
		if (args.has("-r")) {
			let pair = this.findParentUntilValid(path);
			if (!pair) {
				return null;
			}

			let remDirs = pair[1].split("/");
			let curr = pair[0];

			for (let name of remDirs) {
				let temp = curr.createDir(name);
				if (!temp) {
					return null;
				}

				curr = temp;
			}

			return curr;
		}

		return null;
	}

	// TODO: Distinguish between parent (using ..) and self (using .) - have a separate method to parse ., .., and ~ with respective full file paths
	public cd(path: string, args: Map<string, string>): Directory | null {
		if (path.indexOf("/") !== -1) {
			// Convert path to absolute if neccessary
			if (!path.startsWith(fileSystem.root.name)) {
				path = fileSystem.root.name.slice(0, fileSystem.root.name.lastIndexOf("/")) + path;
			}
		}

		// Return "error" if path points to a file
		if (this.find(path, "f") !== null) {
			return null;
		}

		// Move to path if possiple
		let dir = this.find(path, "d");
		if (dir) {
			this.cwd = dir;
		}

		return dir;
	}

	public pwd(): void {
		terminal.println(this.cwd.getPath());
	}

	// Returns the correct directory (or parent directory of file) when user inputs a nested path (d = dir, f = file)
	public find(path: string, type: "d" | "f"): Directory | null {
		let dir = this.cwd;

		if (path.startsWith("/")) {
			dir = fileSystem.root;
			path = path.substring(1);
		}

		let pathArr = path.split("/");

		for (let i = 0; i < pathArr.length; i++) {
			if (i === pathArr.length - 1 && type === "f") {
				if (dir.hasFile(pathArr[i])) {
					return dir;
				}

				return null;
			} else {
				let next = dir.getDir(pathArr[i]);

				if (next == null) {
					return null;
				}

				dir = next;
			}
		}

		return dir;
	}

	// Parses the provided path, replacing relative file paths with absolute ones
	// NOTE: This method doesn't ensure path validity, yet...
	private parsePath(path: string): string {
		// Replace ~ with root path if at beginning
		if (path.startsWith("~")) {
			path = fileSystem.root.name + path.substring(1);
		}

		// Replace . to cwd if at beginning and if not part of a "hidden" file/dir
		let next = path.at(1);
		if (path.startsWith(".") && next && next === "/") {
			path = this.cwd.name + path.substring(1);
		}

		// Parsing .. - make it relate to the previous folder
		// This requires parsing some-dir/../../ etc. to the end
		if (path.indexOf("..") !== -1) {
			let ref = this.cwd;
			let before = path.substring(0, path.indexOf(".."));
			if (before.length > 0) {
				let temp = this.find(before, "d");
				if (!temp) {
					throw new Error(`files: parsePath: couldn't find directory at: ${before}`);
				}

				ref = temp;
			}

			return this.parsePath(ref.parent?.getPath() + path.substring(path.indexOf("..") + 1));
		}

		return path;
	}

	// Finds the parent of the specified dir or file, or null if the dir/file doesn't exist when parsing
	private findParent(path: string): Directory | null {
		return this.find(path.substring(0, path.lastIndexOf("/")), "d");
	}

	// Finds the parent of the specified dir or file as low in the directory tree as possible to the closest parent
	private findParentUntilValid(path: string): [Directory, string] | null {
		let splitPath = path;

		while (splitPath.trim().replaceAll("/", "").length > 0 && this.findParent(splitPath) === null) {
			splitPath = splitPath.substring(0, splitPath.lastIndexOf("/"));
		}

		let parent = this.findParent(splitPath);
		if (!parent) {
			return null;
		}

		return [parent, path.substring(splitPath.length + 1)];
	}

	// Extracts the name of the dir/file with this path.
	public extractName(path: string): string {
		return path.substring(path.lastIndexOf("/") + 1);
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

	public onAppShow(): void {
		
	}

	public onAppHide(): void {
		
	}

	public keydown(event: KeyboardEvent): void {
		
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