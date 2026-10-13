export class File {
	public name: string;
	public parent: Directory;
	public content: string | undefined; // OPT: Support non-text files such as music - store using LocalStorage or as bytes

	constructor(name: string, parent: Directory, content?: string) {
		this.name = name;
		this.parent = parent;
		this.content = content;
	}

	// Recursively gets the path of the current directory
	public getPath(): string {
		return `${this.parent.getPath()}/${this.name}`;
	}
}

export class Directory {
	public name: string;
	public parent: Directory | undefined;
	public files: File[];
	public dirs: Directory[];

	constructor(name: string, parent?: Directory) {
		this.name = name;
		this.parent = parent;
		this.files = [];
		this.dirs = [];
	}

	// NOTE: All of the following methods "name" parameter is only the names of the files/dirs in this folder, you cannot pass in "dir1/file1".
	// NOTE: All of the following methods will return null if the operation fails. To "force" a creation, you must delete the existing object before creating a new one.

	public createFile(name: string): File | null {
		if (this.hasFile(name)) {
			return null;
		}

		let file = new File(name, this);
		this.files.push(file);
		return file;
	}

	public createDir(name: string): Directory | null {
		if (this.hasDir(name)) {
			return null;
		}

		let dir = new Directory(name, this);
		this.dirs.push(dir);
		return dir;
	}

	public removeFile(name: string): boolean {
		// Use linear search since performance is not a concern for this project
		for (let i = 0; i < this.files.length; i++) {
			if (this.files[i].name === name) {
				this.files.splice(i, 1);
				return true;
			}
		}

		return false;
	}

	public removeDir(name: string): boolean {
		// Use linear search since performance is not a concern for this project
		for (let i = 0; i < this.dirs.length; i++) {
			if (this.dirs[i].name === name) {
				this.dirs.splice(i, 1);
				return true;
			}
		}

		return false;
	}

	public hasFile(name: string): boolean {
		// Use linear search since performance is not a concern for this project
		for (let i = 0; i < this.files.length; i++) {
			if (this.files[i].name === name) {
				return true;
			}
		}

		return false;
	}

	public hasDir(name: string): boolean {
		// Use linear search since performance is not a concern for this project
		for (let i = 0; i < this.dirs.length; i++) {
			if (this.dirs[i].name === name) {
				return true;
			}
		}

		return false;
	}

	public getFile(name: string): File | null {
		// Use linear search since performance is not a concern for this project
		for (let i = 0; i < this.files.length; i++) {
			if (this.files[i].name === name) {
				return this.files[i];
			}
		}

		return null;
	}

	public getDir(name: string): Directory | null {
		// Use linear search since performance is not a concern for this project
		for (let i = 0; i < this.dirs.length; i++) {
			if (this.dirs[i].name === name) {
				return this.dirs[i];
			}
		}

		return null;
	}

	// Recursively gets the path of the current directory
	public getPath(): string {
		if (!this.parent) {
			return this.name;
		}

		return `${this.parent.getPath()}/${this.name}`;
	}
}

class FileSystem {
	public root: Directory;

	constructor() {
		this.root = new Directory("/");
	}
}

export const fileSystem = new FileSystem();