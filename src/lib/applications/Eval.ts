import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";

class Eval implements Command {
	public name: string = "eval";
	public desc: string = "evaluates the command during runtime";
	public evalOnLoad: string[] = [];

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [content]`,
			"\t\tcontent: content to evaluate"
		];
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		map.set("content", args.join(" "));

		return map;
	}

	public execute(args: Map<string, string>): void {
		let cmd = args.get("content");

		if (cmd) {
			terminal.executeCommand(cmd);
		}
	}
}

export const app = new Eval();