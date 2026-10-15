import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";

class Goto implements Command {
	public name: string = "goto";
	public desc: string = "go to a website on the world wide web";
	public evalOnLoad: string[] = [];

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [url]`,
			"\t\turl: target website url"
		];
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		map.set("url", args[0]);

		return map;
	}

	public execute(args: Map<string, string>): void {
		let url = args.get("url");

		if (url) {
			if (!/^https?:\/\//i.test(url)) {
				url = "https://" + url;
			}

			window.open(`${url}`, "_blank");
		} else {
			terminal.printerr("goto: no url provided");
		}
	}
}

export const app = new Goto();