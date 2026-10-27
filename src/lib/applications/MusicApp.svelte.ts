import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import type { Command } from "$lib/components/listeners/Terminal.svelte";

class MusicApp implements Command, Application {
	public name: string = "music";
	public desc: string = "barebones music app";
	public evalOnLoad: string[] = [];

	public input: string = $state(""); // Input value of <input>
	public frame: HTMLIFrameElement | undefined;
	public playlist: string[] = $state([]); // Holds array of YouTube video IDs
	public playlistIndex: number = $state(0);
	public src: string = $state("");
	public playing: boolean = $state(false);

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name}`
		];
	}
	
	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		return map;
	}
	
	public execute(args: Map<string, string>): void {
		desktop.switchTo(this);
	}

	// Shuffles the playlist
	public shuffle(): void {
		// Fisher-Yates shuffle algorithm
		for (let i = this.playlist.length - 1; i >= 1; i--) {
			let rand = Math.floor(Math.random() * (i + 1));
			[this.playlist[i], this.playlist[rand]] = [this.playlist[rand], this.playlist[i]];
		}

		this.playlistIndex = 0;
	}

	// Toggles from playing to pausing and vice versa
	public togglePlaying(): void {
		this.playing = !this.playing;
	}

	// TODO (later): Allow user to add videos to TermOS Music playlist through YT playlist URL
	// Adds the YouTube video with ID from <input> to the playlist
	public add(): void {
		// TODO: Allow user to copy paste url - parse video ID from URL (ignoring playlist, etc)
		if (this.input) {
			this.playlist.push(this.input);
			this.input = "";
		}
	}

	// Removes the given ID from the playlist; does nothing otherwise
	public remove(index: number): void {
		this.playlist.splice(index, 1);
	}

	// Application functions

	public onAppShow(): void {

	}
	
	public onAppHide(): void {

	}
	
	public keydown(event: KeyboardEvent): void {
		switch (event.key) {
			case "q":
				if (event.ctrlKey) {
					desktop.quit();
				}
				break;
		}
	}
	
	public keyup(event: KeyboardEvent): void {

	}
	
	public paste(event: ClipboardEvent): void {

	}
	
	public onFocusGain(): void {

	}
	
	public onFocusLost(): void {

	}
}

export const app = new MusicApp();