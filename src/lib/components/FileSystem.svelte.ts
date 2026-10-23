export class File {
	public name: string;
	public parent: Directory;
	private content: string | undefined; // OPT: Support non-text files such as music - store using LocalStorage or as bytes
	public metadata: FileMetadata;

	constructor(name: string, parent: Directory, content?: string) {
		this.name = name;
		this.parent = parent;
		this.content = content;

		// Construct metadata
		this.metadata = new FileMetadata(this.parent.getPath() === fileSystem.root.name ? `${fileSystem.root.name}${this.name}` : `${this.parent.getPath()}/${this.name}`);
	}

	// TEMP: Eventually return bytes so that non-text data can be represented
	public getContent(): string | undefined {
		return this.content;
	}

	// TEMP: Eventually allow bytes as input so that non-text data can be represented
	public setContent(content: string): void {
		this.content = content;

		// Update metadata
		this.metadata.dateModified = this.metadata.now();
		this.metadata.dateAccessed = this.metadata.now();
		this.metadata.size = this.getSize();
	}

	// Calculates the size of the file in bytes
	public getSize(): number {
		return new TextEncoder().encode(this.content).length;
	}
}

export class Directory {
	public name: string;
	public parent: Directory | undefined;
	public files: File[];
	public dirs: Directory[];
	public metadata: FileMetadata;

	constructor(name: string, parent?: Directory) {
		this.name = name;
		this.parent = parent;
		this.files = [];
		this.dirs = [];

		// Construct metadata
		this.metadata = new FileMetadata(this.parent ? `${this.parent.getPath()}/${this.name}` : this.name);
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
			let trailing = this.name.lastIndexOf("/");
			return this.name.slice(0, trailing) + this.name.slice(trailing + 1);
		}

		return `${this.parent.getPath()}/${this.name}`;
	}

	// Returns all files and dirs in one union array, sorted alphabetically by name
	public getAll(): (Directory | File)[] {
		let arr: (Directory | File)[] = [];
		arr = arr.concat(this.dirs).concat(this.files);

		return arr.sort((a, b) => a.name.localeCompare(b.name));
	}
}

export class FileMetadata {
	public readonly dateCreated: number = -1; // Dates in Unix Time to UTC (automatically convert to local time when displaying)
	public dateModified: number = 0;
	public dateAccessed: number = 0;
	public readonly path: string = "";
	public readonly nameWithoutExt: string = "";
	public readonly extension: string = ""; // HTML style (aka image/jpeg, application/json, text/plain, etc.)
	public size: number = 0; // In bytes

	// path should be the full path, with file name and extension
	constructor(path: string) {
		this.dateCreated = this.now();
		this.path = path;
		this.nameWithoutExt = path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
		this.extension = path.substring(path.lastIndexOf("."));
	}

	public modified(): number {
		this.dateModified = this.now();
		return this.dateModified;
	}

	public accessed(): number {
		this.dateAccessed = this.now();
		return this.dateAccessed;
	}

	// Convenience method to get standardized unix time
	public now(): number {
		return Date.now();
	}
}

class FileSystem {
	public root: Directory;

	public readonly LS_KEY = "fileSystem";

	constructor() {
		this.root = new Directory("/");
	}

	// Saves the root Directory as a JSON string in localStorage
	public save(): void {
		localStorage.setItem(this.LS_KEY, JSON.stringify(this.root));
	}

	// Loads the root Directory from localStorage and returns true; false otherwise
	public load(): boolean {
		let root = localStorage.getItem(this.LS_KEY);

		if (root) {
			this.root = JSON.parse(root) as Directory;
		}

		return Boolean(root);
	}
}

export const fileSystem = new FileSystem();