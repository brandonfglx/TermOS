import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import type { Command } from "$lib/components/listeners/Terminal.svelte";
import type ErrorDialog from "$lib/utils/ErrorDialog.svelte";
import type InfoDialog from "$lib/utils/InfoDialog.svelte";
import type InputDialog from "$lib/utils/InputDialog.svelte";
import { waitUntil } from "$lib/utils/utils";

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

	public player: YT.Player | undefined;
	private host: HTMLDivElement | undefined;
	private apiPromise: Promise<void> | undefined;

	public inputDialog = $state<ReturnType<typeof InputDialog> | null>(null);
	public infoDialog = $state<ReturnType<typeof InfoDialog> | null>(null);
	public errorDialog = $state<ReturnType<typeof ErrorDialog> | null>(null);

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name}`
		];
	}
	
	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		map.set("music", args.join(" "));

		return map;
	}
	
	public execute(args: Map<string, string>): void {
		desktop.switchTo(this);

		this.addThis(args.get("music") ?? "");
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
		if (!this.player || !this.currentVideo) {
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
			if (!parsed) {
				this.errorDialog?.error({
					title: "Video Error",
					content: `Invalid URL or ID: ${this.input}`
				});
				return;
			}

			if (this.isVideo(parsed)) {
				this.playlist.push(parsed);
				this.input = "";
			} else if (typeof parsed === "string") {
				// Cue playlist, read videos, then start playing the first video
				if (!this.player) {
					this.errorDialog?.error({
						title: "Video Error",
						content: "Player does not exist"
					});
					return;
				}

				this.player.cuePlaylist({
					listType: "playlist",
					list: parsed
				});

				this.input = "";
			} else {
				this.errorDialog?.error({
					title: "music:",
					content: `Could not parse ID/URL: ${this.input}`
				});
				return;
			}
		}

		// Only start playing if its the first one added to playlist
		if (first) {
			this.play();
		}
	}

	// Adds the URLs or Playlists to the playlist, waits until DOM is loaded to properly load playlist
	public async addThis(val: string, play: boolean = true): Promise<void> {
		if (val.length === 0) {
			return;
		}

		let allMusic = val.split(" ").filter((val) => val.length > 0);

		let errors: string[] = [];
		let cuedPlaylist = false;

		for (const music of allMusic) {
			let parsed = this.parseInput(music);
			if (!parsed) {
				errors.push(`Invalid URL or ID: ${music}`);
				continue;
			}

			if (this.isVideo(parsed)) {
				this.playlist.push(parsed);
				continue;
			}

			if (typeof parsed !== "string") {
				errors.push(`Could not parse ID/URL: ${music}`)
				continue;
			}

			// Wait until the player is present
			try {
				await waitUntil(() => (this.ready ? this.player : undefined));
			} catch {
				errors.push(`Player did not become ready for: ${music}`);
				continue;
			}

			let prev = this.player;
			if (!prev) {
				errors.push(`Player doesn't exist for ${music}`);
				continue;
			}

			prev.cuePlaylist({
				listType: "playlist",
				list: parsed
			});
			cuedPlaylist = true;

			// Wait for replacement player before cueing another video
			try {
				await waitUntil(() => (this.player !== prev && this.ready ? this.player : undefined));
			} catch {
				errors.push(`Timed out when loading video: ${music}`);
			}
		}

		if (play && !cuedPlaylist && this.ready) {
			this.play();
		}

		if (errors.length > 0) {
			this.errorDialog?.error({
				title: "Error(s) occurred in addThis()",
				content: errors.join("\n")
			});
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

		let url: URL;

		try {
			url = new URL(input);
		} catch {
			return null;
		}

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
		this.loadApi().then(() => {
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
				script.onerror = () => Promise.reject(new Error("YouTube IFrame API failed to load"));
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

	public async playerChange(event: YT.OnStateChangeEvent): Promise<void> {
		switch (event.data) {
			case YT.PlayerState.CUED:
				// Read playlist contents, then reload player to start fresh with new playlists
				let ids = this.player?.getPlaylist() ?? [];
				let errorIds: string[] = [];

				this.playlist = ids.map((id) => {
						let result = this.parseInput(id);
						if (!result) {
							errorIds.push(id);
						}
						return result;
					})
					.filter((v): v is Video => this.isVideo(v));
				this.playlistIndex = 0;

				// Show errors and await before preceeding
				if (errorIds.length > 0) {
					await this.errorDialog?.error({
						title: "Playlist Error",
						content: `Invalid IDs:\n${errorIds.join("\n")}`
					});
				}

				// Schedule player creation
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
				this.errorDialog?.error({
					title: "Invalid YouTube video ID or URL",
					content: `"${this.currentVideo.id}" is not a valid YouTube video ID or URL.`
				});
				break;
			case 5:
				this.errorDialog?.error({
					title: "HTML5 Error",
					content: `"${this.currentVideo.id}" cannot be played in an HTML5 player.`
				});
				break;
			case 100:
				this.errorDialog?.error({
					title: "Video Error",
					content: `"${this.currentVideo.id}" cannot be found, or is private or removed.`
				});
				break;
			case 101:
			case 150:
				this.errorDialog?.error({
					title: "Video Error",
					content: `"${this.currentVideo.id}" does not allow embedded playback.`
				});
				break;
			default:
				this.errorDialog?.error({
					title: "Unknown Error",
					content: `An unknown error occurred when trying to play "${this.currentVideo.id}"`
				});
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