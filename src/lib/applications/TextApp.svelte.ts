import { Directory, File } from "$lib/components/FileSystem.svelte";
import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import type { Command } from "$lib/components/listeners/Terminal.svelte";
import { app as files } from "./FilesApp";

class TextApp implements Command, Application {
	public name: string = "text";
	public desc: string = "a basic text editor";
	public evalOnLoad: string[] = [];

	private dir: Directory | null = null;
	private file: File | null = null;

	// Each line is represented as an element of the array
	public content = $state<string[]>([]);

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [path] [...flags] [...text]`,
			"\tArgs:",
			"\t\tpath: path of file to edit (does not need to exist)",
			"\t\tflags: changes GUI and CLI behavior",
			"\t\t\t-a: appends the text to the end of the file",
			"\t\ttext: writes text to the file at that path (does not open GUI)",
		];
	}
	
	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		if (args.length === 0) {
			return map;
		}

		map.set("path", args[0]);

		if (args.length === 1) {
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
	
	public execute(args: Map<string, string>): void {
		// Validate or create file
		let path = args.get("path");
		if (!path) {
			throw new Error("text: must specify file path");
		}

		// Find from root
		if (path.indexOf("/") === -1) {
			this.dir = files.getCwd();
		} else {
			this.dir = files.find(path, "f");
			if (!this.dir) {
				// Directory doesn't exist, throw error
				throw new Error(`text: parent directory not found for: ${path}`);
			}
		}

		// Creates the file, doesn't override if it exists
		this.dir.createFile(files.extractName(path));
		this.file = this.dir.getFile(files.extractName(path))!;

		// Load GUI
		if (args.size === 1) {
			desktop.switchTo(this);
		}

		let content = this.process(args.get("etc") ?? "");

		// Write to file without GUI
		if (args.has("-a")) {
			let prevContent = this.file.getContent();
			if (prevContent) {
				this.file.setContent(prevContent + content);
			} else {
				this.file.setContent(content);
			}
		} else {
			this.file.setContent(content);
		}
	}

	// Processes escape sequences inside a string
	public process(content: string): string {
		let result = "";

		for (let i = 0; i < content.length; i++) {
			if (content.charAt(i) === "\\") {
				if (i === content.length - 1) {
					throw new Error("text: process: failed to process missing identifier");
				}

				let next = content.charAt(++i);
				switch (next) {
					case "\\":
						result += "\\";
						break;
					case "\"":
						result += "\"";
						break;
					case "t":
						result += "\t";
						break;
					case "n":
						result += "\n";
						break;
					default:
						throw new Error(`text: process: failed to process unknown identifier: ${next}`);
				}
			} else {
				result += content.charAt(i);
			}
		}

		return result;
	}

	// Application-specific functions

	// Saves file content stored in app to file
	public save(): void {
		
	}

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

	// Requires a value for flags, prevents ambiguity when parsing args
	private needsValue(flag: string): boolean {
		switch (flag) {
			default:
				return false;
		}
	}
}

export const app = new TextApp();