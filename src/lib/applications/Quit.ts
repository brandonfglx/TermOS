import { desktop } from "$lib/components/listeners/Desktop.svelte";
import type { Command } from "$lib/components/listeners/Terminal.svelte";

class Quit implements Command {
	public name: string = "quit";
	public desc: string = "quits the current program";
	public evalOnLoad: string[] = [];

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name}`
		]
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		return map;
	}

	public execute(args: Map<string, string>): void {
		desktop.quit();
	}

}

export const app = new Quit();