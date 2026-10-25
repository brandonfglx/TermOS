import type { Application } from "$lib/components/listeners/Desktop.svelte";
import type { Command } from "$lib/components/listeners/Terminal.svelte";

class MusicApp implements Command, Application {
	public name: string = "music";
	public desc: string = "barebones music app";
	public evalOnLoad: string[] = [];

	public help(args?: string[]): string[] {
		throw new Error("Method not implemented.");
	}
	
	public parseArgs(args: string[]): Map<string, string> {
		throw new Error("Method not implemented.");
	}
	
	public execute(args: Map<string, string>): void {
		throw new Error("Method not implemented.");
	}

	public onAppShow(): void {
		throw new Error("Method not implemented.");
	}
	
	public onAppHide(): void {
		throw new Error("Method not implemented.");
	}
	
	public keydown(event: KeyboardEvent): void {
		throw new Error("Method not implemented.");
	}
	
	public keyup(event: KeyboardEvent): void {
		throw new Error("Method not implemented.");
	}
	
	public paste(event: ClipboardEvent): void {
		throw new Error("Method not implemented.");
	}
	
	public onFocusGain(): void {
		throw new Error("Method not implemented.");
	}
	
	public onFocusLost(): void {
		throw new Error("Method not implemented.");
	}
}

export const app = new MusicApp();