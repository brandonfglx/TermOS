import type { Component } from "svelte";
import type { KeyboardListener } from "../KeyboardManager.svelte";

class Desktop implements KeyboardListener {
	public apps = $state<Component[]>([]);

	public loadApplications(): void {
		const modules = import.meta.glob<{default: Component}>("$lib/applications/*.svelte", { eager: true });

		for (const path in modules) {
			const component = modules[path].default;
			this.apps.push(component);
		}
	}
	
	public keydown(event: KeyboardEvent): void {
		
	}

	public keyup(event: KeyboardEvent): void {
		
	}

	public paste(event: ClipboardEvent): void {
		
	}
}

export const desktop = new Desktop();