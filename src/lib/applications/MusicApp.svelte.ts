import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import type { Command } from "$lib/components/listeners/Terminal.svelte";

class MusicApp implements Command, Application {
	public name: string = "music";
	public desc: string = "barebones music app";
	public evalOnLoad: string[] = [];

	public input: string = $state(""); // Input value of <input>
	public playlist: Video[] = $state([]); // Holds array of YouTube video IDs
	public playlistIndex: number = $state(0);
	public currentVideo = $derived(this.playlist[this.playlistIndex] ?? null);
	public playing: boolean = $state(false);
	public ready = $state(false);
	public error: string | null = $state(null);

	public player: YT.Player | undefined;
	private host: HTMLDivElement | undefined;
	private apiPromise: Promise<void> | undefined;

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
		this.play();
	}

	// Toggles from playing to pausing and vice versa
	public togglePlaying(): void {
		if (!this.player) {
			return;
		}

		if (this.playing) {
			this.player.pauseVideo();
		} else {
			this.player.playVideo();
		}

		// Switch for clicking external play/pause button
		this.playing = !this.playing;
	}

	// Adds the YouTube video with ID from <input> to the playlist
	public add(): void {
		let first = this.playlist.length === 0;

		if (this.input) {
			let parsed = this.parseInput(this.input);
			console.log(parsed);
			if (!parsed) {
				return;
			}

			if (this.isVideo(parsed)) {
				this.playlist.push(parsed);
				this.input = "";
			} else if (typeof parsed === "string") {
				// Cue playlist, read videos, then start playing the first video
				if (!this.player) {
					return;
				}

				this.player.cuePlaylist({
					listType: "playlist",
					list: parsed
				});

				this.input = "";
			} else {
				throw new Error(`Could not parse ID/URL: ${this.input}`);
			}
		}

		// Only start playing if its the first one added to playlist
		if (first) {
			this.play();
		}
	}

	// Extracts the video metadata (with ID) from a YT URL - a playlist is represented by a string (use cuePlaylist(), then getPlaylist() to load video array), videos are their own type (video details will be loaded once they are played - uses hidden getVideoData() method)
	public parseInput(input: string): Video | string | null {
		if (!input) {
			return null;
		}

		if (input.match(/^[a-zA-Z0-9_-]{11}$/)) {
			return {
				id: input
			} as Video;
		}

		let url = new URL(input);

		if (!url.hostname.includes("youtube.com") && !url.hostname.includes("youtu.be") && !url.hostname.includes("youtube-nocookie.com")) {
			return null;
		}

		if (url.pathname === "/playlist") {
			return url.searchParams.get("list");
		}

		return {
			id: url.searchParams.get("v")
		} as Video;
	}

	// Removes the given ID from the playlist; does nothing otherwise
	public remove(index: number): void {
		this.playlist.splice(index, 1);
	}

	public attachHost(host: HTMLDivElement): void {
		this.host = host;
		void this.loadApi().then(() => {
			if (this.host === host) {
				this.createPlayer();
			}
		});
	}

	public detachHost(): void {
		this.destroyPlayer();
		this.host = undefined;
	}

	public createPlayer(): void {
		if (!this.host || !window.YT?.Player) {
			return;
		}

		this.player?.destroy();
		this.player = undefined;
		this.ready = false;
		this.playing = false;

		// Create new element
		let mount = document.createElement("div");
		mount.className = "w-full h-full";
		this.host.replaceChildren(mount);

		this.player = new window.YT.Player(mount, {
			events: {
				onReady: (event) => this.playerReady(event),
				onStateChange: (event) => this.playerChange(event),
				onError: (error) => this.playerError(error)
			}
		});
	}

	private destroyPlayer(): void {
		this.player?.destroy();
		this.player = undefined;
		this.ready = false;
		this.playing = false;
		this.host?.replaceChildren();
	}

	private loadApi(): Promise<void> {
		if (window.YT?.Player) {
			return Promise.resolve();
		}

		this.apiPromise ??= new Promise<void>((resolve) => {
			let prev = window.onYouTubeIframeAPIReady;
			window.onYouTubeIframeAPIReady = () => {
				prev?.();
				resolve();
			}

			if (!document.querySelector("script[src=\"https://www.youtube.com/iframe_api\"]")) {
				let script = document.createElement("script");
				script.src = "https://www.youtube.com/iframe_api";
				script.async = true;
				document.head.appendChild(script);
			}
		});

		return this.apiPromise;
	}

	public playerReady(event: YT.PlayerEvent): void {
		this.ready = true;

		// Auto-resume track if player restarted
		if (this.currentVideo) {
			this.play();
			return;
		}
	}

	public playerChange(event: YT.OnStateChangeEvent): void {
		switch (event.data) {
			case YT.PlayerState.CUED:
				// Read playlist contents, then reload player to start fresh with new playlists
				let ids = this.player?.getPlaylist() ?? [];

				this.playlist = ids.map((id) => this.parseInput(id))
					.filter((v): v is Video => this.isVideo(v));
				this.playlistIndex = 0;
				this.error = null;

				setTimeout(() => this.createPlayer(), 0);
				break;
			case YT.PlayerState.PLAYING:
				this.playing = true;

				// Load in Video details and assign them to current video
				if (this.player) {
					let details = this.player.getVideoData();
					this.currentVideo.title = details.title;
					this.currentVideo.author = details.author;
				}
				break;
			case YT.PlayerState.PAUSED:
				this.playing = false;
				break;
			case YT.PlayerState.ENDED:
				// Autoplay the next available track
				this.playing = false;
				this.playNext();
				break;
		}
	}

	// Increments the playlistIndex and plays the corresponding video
	public playNext(): void {
		this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length;
		this.play();
	}

	// Plays the video corresponding to the current playlistIndex
	public play(): void {
		if (!this.player || !this.currentVideo) {
			return;
		}

		this.player.loadVideoById(this.currentVideo.id);
	}

	// Changes playlist index to the value; returns true if succeeded, false otherwise
	public playAt(index: number): boolean {
		if (index < 0 || index >= this.playlist.length) {
			return false;
		}

		this.playlistIndex = index;
		this.play();

		return true;
	}

	public playerError(event: YT.OnErrorEvent) {
		switch (event.data) {
			case 2:
				this.error = `Invalid YouTube video ID or URL (${this.currentVideo.id})`;
				break;
			case 5:
				this.error = `Video cannot be played in an HTML5 player`;
				break;
			case 100:
				this.error = `Video not found, private, or removed`;
				break;
			case 101:
			case 150:
				this.error = `Video does not allow embedded playback`;
				break;
			default:
				this.error = `Unknown error occurred`;
				break;
		}
	}

	public isVideo(obj: any): obj is Video {
		return obj !== null && typeof obj === "object" && typeof obj.id === "string";
	}

	// Application functions

	public onAppShow(): void {
		
	}
	
	public onAppHide(): void {
		this.player?.pauseVideo();
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

type Video = {
	id: string,
	title?: string,
	author?: string,
	start?: number,
	end?: number
}

export const app = new MusicApp();