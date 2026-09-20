import type { Command } from "$lib/components/listeners/Terminal.svelte";

class TerminalApp implements Command {
	public name: string = "term";
	public desc: string = "core terminal for TermOS";

	public help(args?: string[]): string[] {
		throw new Error("Method not implemented.");
	}

	public parseArgs(args: string[]): Map<string, string> {
		throw new Error("Method not implemented.");
	}
	
	public execute(args: Map<string, string>): void {
		throw new Error("Method not implemented.");
	}	
}

export const app = new TerminalApp();