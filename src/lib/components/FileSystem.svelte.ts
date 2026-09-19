export class File {
	public name: string;
	public content: string | undefined; // OPT: Support non-text files such as music - store using LocalStorage

	constructor(name: string, content?: string) {
		this.name = name;
		this.content = content;
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

	public createFile(name: string): File {
		let file = new File(name);
		this.files.push(file);
		return file;
	}

	public createDir(name: string): Directory {
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
}

class FileSystem {
	public root: Directory;

	constructor() {
		this.root = new Directory("root");
	}
}

export const fileSystem = new FileSystem();