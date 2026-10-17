import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { File, Directory, fileSystem } from "$lib/components/FileSystem.svelte";

class FilesApp implements Command, Application {
	public name: string = "files";
	public desc: string = "access files in a virtual file system and save it in LocalStorage";
	public evalOnLoad: string[] = [
		"alias ls files",
		"alias touch files touch",
		"alias mkdir files mkdir",
		"alias cd files cd",
		"alias rm files rm",
		"alias save files save",
		"alias load files load",
	];

	private cwd: Directory = fileSystem.root;

	public readonly EL_PER_LINE = 5;

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [action] [...args]`,
			"\tArgs:",
			"\t\taction: action to perform",
			"\t\t\ttouch: create a file",
			"\t\t\trm: remove a file",
			"\t\t\tmkdir: create a directory",
			"\t\t\tcd: change directory",
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
			// Print directories (sorted alphabetically)
			if (this.cwd.dirs.length > 0) {
				let dirs = this.cwd.dirs.toSorted();
				let maxLength = this.cwd.dirs.toSorted((a, b) => b.name.length - a.name.length)[0].name.length;

				// Process in batches
				for (let i = 0; i < Math.floor(dirs.length / this.EL_PER_LINE); i++) {
					let line = "";

					for (let j = i; j < this.EL_PER_LINE; j++) {
						line += dirs[j].name.padEnd(maxLength + 1);
					}

					terminal.printf(line, {});
				}

				let rest = "";
				for (let i = dirs.length - dirs.length % this.EL_PER_LINE; i < dirs.length; i++) {
					rest += dirs[i].name.padEnd(maxLength + 1);
				}
				terminal.printf(rest, {});
			}

			// Print files (sorted alphabetically)
			if (this.cwd.dirs.length > 0) {
				let files = this.cwd.files.toSorted();
				let maxLength = this.cwd.files.toSorted((a, b) => b.name.length - a.name.length)[0].name.length;

				// Process in batches
				for (let i = 0; i < Math.floor(files.length / this.EL_PER_LINE); i++) {
					let line = "";

					for (let j = i; j < this.EL_PER_LINE; j++) {
						line += files[j].name.padEnd(maxLength + 1);
					}

					terminal.printf(line, {});
				}

				let rest = "";
				for (let i = files.length - files.length % this.EL_PER_LINE; i < files.length; i++) {
					rest += files[i].name.padEnd(maxLength + 1);
				}
				terminal.printf(rest, {});
			}

			return;
		}

		let remArgs = new Map(args);
		remArgs.delete("etc");

		let etc = args.get("etc");
		if (!etc) {
			throw new Error("files: missing path");
		}

		// Calls appropriate action
		switch (args.get("action")) {
			case "touch":
				this.touch(etc, remArgs);
				break;
			case "rm":
				let succeded = this.rm(etc, remArgs);
				if (!succeded) {
					throw new Error(`files rm: failed to remove: ${etc}`);
				}
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
		let dir = this.findParent(path);

		if (dir == null) {
			return null;
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
		if (path.startsWith(fileSystem.root.name)) {
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

		// Try removing from files first from cwd, then dirs
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

	public mkdir(path: string, args: Map<string, string>): Directory | null {
		// Check whether the directory is being created from root
		if (path.startsWith(fileSystem.root.name)) {
			let dir = this.findParent(path);
			let name = this.extractName(path);

			if (dir == null) {
				return null;
			}

			return dir.createDir(name);
		}

		// Creating relative to current directory
		if (path.indexOf("/") === -1) {
			return this.cwd.createDir(path);
		}

		// Creating relative to directory and is nested (requires -r)
		if (args.has("-r")) {

		}

		return null;
	}

	public cd(path: string, args: Map<string, string>): Directory | null {
		if (this.find(path, "f") != null) {
			return null;
		}

		let dir = this.find(path, "d");
		if (dir) {
			this.cwd = dir;
		}

		return dir;
	}

	// Returns the correct directory (or parent directory of file) when user inputs a nested path (d = dir, f = file)
	private find(path: string, type: "d" | "f"): Directory | null {
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

	// Finds the parent of the specified dir or file, or null if the dir/file doesn't exist when parsing
	private findParent(path: string): Directory | null {
		return this.find(path.substring(0, path.lastIndexOf("/")), "d");
	}

	// Extracts the name of the dir/file with this path.
	public extractName(path: string): string {
		return path.substring(path.lastIndexOf("/") + 1);
	}

	private needsValue(flag: string): boolean {
		switch (flag) {

			default:
				return false;
		}
	}

	// Application handlers

	public onAppShow(): void {
		
	}

	public keydown(event: KeyboardEvent): void {
		
	}

	public keyup(event: KeyboardEvent): void {
		
	}

	public paste(event: ClipboardEvent): void {
		
	}
}

export const app = new FilesApp();