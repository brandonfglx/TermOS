import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import type { Command } from "$lib/components/listeners/Terminal.svelte";
import { File, Directory, fileSystem } from "$lib/components/FileSystem.svelte";

class FilesApp implements Command, Application {
	public name: string = "files";
	public desc: string = "access files in a virtual file system and save it in LocalStorage";

	private cwd: Directory = fileSystem.root;

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
			`\t\targs: arguments for the action (list of available args can be found with \"help ${this.name} [action]\")`
		];
	}

	public parseArgs(args: string[]): Map<string, string> {
		// throw new Error("Method not implemented.");
		return new Map<string, string>();
	}

	// Allow users to create files using `files create [name].[ext]` or delete using `files delete [name].txt` -> create aliases for `touch [name].[ext]` and `rm [name].[ext]`
	public execute(args: Map<string, string>): void {
		console.log(desktop.switchTo(this));
		// throw new Error("Method not implemented.");
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
		let dir = this.findParent(path);
		let name = this.extractName(path);

		if (dir == null) {
			return false;
		}

		// Tries files first since it doesn't require -r
		if (dir.hasFile(name)) {
			return dir.removeFile(name);
		} else if (args.has("--recursive") && dir.hasFile(name)) {
			return dir.removeDir(name);
		}

		return false;
	}

	public mkdir(path: string, args: Map<string, string>): Directory | null {
		let dir = this.findParent(path);
		let name = this.extractName(path);

		if (dir == null) {
			return null;
		}

		return dir.createDir(name);
	}

	public cd(path: string, args: Map<string, string>): Directory | null {
		if (this.find(path, "f") != null) {
			return null;
		}

		return this.find(path, "d");
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

	// Command handlers

	public onCmdLoad(): void {

	}

	// Application handlers

	public onAppLoad(): void {
		
	}

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