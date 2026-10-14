import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";

class Echo implements Command {
	public name: string = "echo";
	public desc: string = "outputs characters to stdout";
	public evalOnLoad: string[] = [];

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [content]`,
			"\t\tcontent: content to output to stdout; if empty, outputs a newline"
		];
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		map.set("content", args.join(" "));

		return map;
	}

	public execute(args: Map<string, string>): void {
		terminal.println(args.get("content"));
	}
}

export const app = new Echo();