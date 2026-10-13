import type { Component } from "svelte";
import type { KeyboardListener } from "../KeyboardManager.svelte";
import { SvelteMap } from "svelte/reactivity";

class Desktop implements KeyboardListener {
	public apps = $state(new SvelteMap<Application, Component>());
	public active = $state<[Application, Component] | null>(null);
	private default: string = "TerminalApp"; // Default app, finds by matching name
	private switching = $state(false);
	private switchIndex = $state(0);

	public loadApplications(): void {
		const svModules = import.meta.glob<{default: Component}>("$lib/applications/*App.svelte", { eager: true });
		const tsModules = import.meta.glob<Application>("$lib/applications/*App.ts", { eager: true });

		const svEntries = Object.entries(svModules);
		const tsEntries = Object.entries(tsModules);

		for (let i = 0; i < svEntries.length && i < tsEntries.length; i++) {
			const [svPath, svObj] = svEntries[i];
			const [tsPath, tsObj] = tsEntries[i];

			if (svPath.indexOf(this.default) !== -1 && tsPath.indexOf(this.default) !== -1) {
				this.active = [tsObj, svObj.default];
			}

			this.apps.set(tsObj, svObj.default);
		}
	}
	
	public keydown(event: KeyboardEvent): void {
		if (this.switching && event.metaKey) {
			if (event.metaKey && event.key === "Tab" || event.key === "ArrowRight") {
				this.switchIndex = Math.min(this.apps.size, this.switchIndex + 1);
			} else if (event.key === "ArrowLeft") {
				this.switchIndex = Math.max(0, this.switchIndex - 1);
			}
		} else {
			this.switching = false;
		}

		if (event.metaKey && event.key === "Tab") {
			this.switching = true;
		}

		if (this.active) {
			this.active[0].keydown(event);
		}
	}

	public keyup(event: KeyboardEvent): void {
		if (this.active) {
			this.active[0].keyup(event);
		}
	}

	public paste(event: ClipboardEvent): void {
		if (this.active) {
			this.active[0].paste(event);
		}
	}
}

export interface Application {
	name: string,
	desc: string,
	keydown(event: KeyboardEvent): void;
	keyup(event: KeyboardEvent): void;
	paste(event: ClipboardEvent): void;
}

export const desktop = new Desktop();