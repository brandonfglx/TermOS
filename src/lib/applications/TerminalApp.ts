import type { Application } from "$lib/components/listeners/Desktop.svelte";
import type { Command } from "$lib/components/listeners/Terminal.svelte";

class TerminalApp implements Command, Application {
	public name: string = "term";
	public desc: string = "core terminal for TermOS";
	public evalOnLoad: string[] = [];

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name}`
		]
	}

	public parseArgs(args: string[]): Map<string, string> {
		throw new Error();
	}
	
	// Allow users to change settings through here; maybe bring up a settings page?
	public execute(args: Map<string, string>): void {
		throw new Error("Method not implemented.");
	}

	// Application handlers

	public onAppShow(): void {
		
	}

	public keydown(event: KeyboardEvent): void {
		
	}

	public keyup(event: KeyboardEvent): void {
		
	}

	public paste(event: ClipboardEvent): void {
		
	}
}

export const app = new TerminalApp();