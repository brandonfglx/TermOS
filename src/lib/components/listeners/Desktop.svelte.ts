import type { Component } from "svelte";
import { kbManager, type KeyboardListener } from "../KeyboardManager.svelte";
import { SvelteMap } from "svelte/reactivity";

class Desktop implements KeyboardListener {
	private apps = $state(new SvelteMap<string, Application>());
	private comps = $state(new SvelteMap<string, Component>());
	public active = $state<[string, Application, Component] | null>(null); // Application name paired with actual Component (HTML)
	public history = $state<Application[]>([]);
	private default: string = "TerminalApp"; // Initially loaded app, finds by matching name
	private switching = $state(false);
	private switchIndex = $state(0);

	public loadApplications(): void {
		const svModules = import.meta.glob<{default: Component}>("$lib/applications/*App.svelte", { eager: true });
		const tsModules = import.meta.glob<any>("$lib/applications/*App.{ts,svelte.ts}", { eager: true });

		const svEntries = Object.entries(svModules);
		const tsEntries = Object.entries(tsModules);

		for (let i = 0; i < svEntries.length && i < tsEntries.length; i++) {
			const [svPath, svObj] = svEntries[i];
			const [tsPath, tsObj] = tsEntries[i];
			const tsApp = tsObj.app as Application;

			if (svPath.indexOf(this.default) !== -1 && tsPath.indexOf(this.default) !== -1) {
				this.active = [tsApp.name, tsApp, svObj.default];
				this.history.push(tsApp);
			}

			this.apps.set(tsApp.name, tsApp);
			this.comps.set(tsApp.name, svObj.default);
		}
	}

	// Switches to the given application and returns true; returns false if the app doesn't have a corresponding Component
	public switchTo(app: Application): boolean {
		let comp = this.comps.get(app.name);

		if (comp) {
			this.active?.[1].onAppHide();

			this.active = [app.name, app, comp];

			// Automatically make kbManager direct key events to application
			kbManager.makeActive(app);
			this.history.push(app);

			app.onAppShow();

			return true;
		}

		return false;
	}

	// Quits the current application and reverts to the last active application, if there is no history, returns to the default application
	// Returns true if it returned to the previous application; false otherwise
	public quit(): boolean {
		let prev = this.history.at(-2);
		if (prev) {
			return this.switchTo(prev);
		}

		let def = this.apps.get(this.default);
		if (def) {
			return this.switchTo(def);
		}

		return false;
	}

	// Checks whether the given application is currently the active applicaiton
	public isActive(app: Application, strict: boolean = false): boolean {		
		if (app.name !== this.active?.[0]) {
			return false;
		}

		if (strict && app !== this.active?.[1]) {
			return false;
		}

		return true;
	}

	public getApps(): SvelteMap<string, Application> {
		return this.apps;
	}

	public getComps(): SvelteMap<string, Component> {
		return this.comps;
	}

	// NOTE: Applications themselves should implement their own KeyboardManager, which captures the events passed by the Desktop
	//		only if they have elements that need to capture key presses (<input> can still be used as raw, but may conflict with
	//		KeyboardManager inputs).
	
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
			this.active[1].keydown(event);
		}
	}

	public keyup(event: KeyboardEvent): void {
		if (this.active) {
			this.active[1].keyup(event);
		}
	}

	public paste(event: ClipboardEvent): void {
		if (this.active) {
			this.active[1].paste(event);
		}
	}

	public onFocusGain(): void {
		
	}

	public onFocusLost(): void {
		
	}
}

export interface Application {
	name: string,
	desc: string,
	onAppShow(): void, // Runs every time an application is shown (even when the previous app was itself)
	onAppHide(): void, // Runs every time an applicaiton is hidden/closed
	keydown(event: KeyboardEvent): void;
	keyup(event: KeyboardEvent): void;
	paste(event: ClipboardEvent): void;
	onFocusGain(): void;
	onFocusLost(): void;
}

export const desktop = new Desktop();