import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { app as files } from "./FilesApp.svelte.ts";

class Info implements Command {
	public name: string = "info";
	public desc: string = "get info about the current device or a file's metadata";
	public evalOnLoad: string[] = [];

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name}`,
			`\t       ${this.name} [path]`,
			"\tArgs:",
			"\t\tpath: path to object to inspect the metadata for"
		];
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		let path = args[0];
		if (path) {
			map.set("path", path);
		}

		return map;
	}

	public async execute(args: Map<string, string>): Promise<void> {
		if (args.size === 0) {
			(await this.getInfo()).forEach((str) => {
				terminal.println(str);
			});
			return;
		}

		let path = args.get("path");
		if (!path) {
			terminal.printerr("info: no file path provided");
			return;
		}

		// Parse file path for validity
		let dir = files.find(path, "f");
		if (!dir) {
			// Try getting as directory
			let dir = files.find(path, "d");
			if (!dir) {
				terminal.printerr(`info: invalid path: ${path}`);
				return;
			}

			terminal.println(JSON.stringify(dir.metadata, null, 2));
			dir.metadata.dateAccessed = dir.metadata.now();

			return;
		}

		let file = dir.getFile(files.extractName(path))!;
		terminal.println(JSON.stringify(file.metadata, null, 2));

		file.metadata.dateAccessed = file.metadata.now();
	}

	private async getInfo(): Promise<string[]> {
		// GPU info
		let canvas = document.createElement("canvas");
		let gl = canvas.getContext("webgl");
		let gpu = gl?.getParameter(gl.RENDERER);
		canvas.remove();

		return [
			`User Agent: ${navigator.userAgent}`,
			`Window: ${window.innerWidth}px x ${window.innerHeight}px`,
			`CPU Cores: ${navigator.hardwareConcurrency}`,
			`GPU: ${gpu}`
		];
	}
}

export const app = new Info();