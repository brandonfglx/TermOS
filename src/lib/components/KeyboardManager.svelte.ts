// Manages how the website handles key inputs
// Some keybinds are always attributed to a component (eg ctrl + ` for switching btwn apps)
// 		otherwise, keys are directed to the "active" element - the "active" element is determined as the last component that calls for the keyboard manager to focus on it

import { terminal } from "./listeners/Terminal.svelte";

export interface KeyboardListener {
	keydown(event: KeyboardEvent): void;
	keyup(event: KeyboardEvent): void;
	paste(event: ClipboardEvent): void;
}

// Ironically, the KeyboardManager is also a KeyboardListener, but has the power to direct controls
class KeyboardManager implements KeyboardListener {
	private default: KeyboardListener | null = null;
	private active: KeyboardListener | null = null;
	private listeners: KeyboardListener[] = [];

	constructor() {
		this.loadListeners();
	}

	// Load all KeyboardListeners (must be placed inside $lib/components/listeners)
	private loadListeners() {
		const modules = import.meta.glob<{default: KeyboardListener}>("./listeners/*.svelte.ts", { eager: true });

		for (const path in modules) {
			const listener = modules[path].default;

			this.listeners.push(listener);
		}
	}

	public makeDefault(listener: KeyboardListener) {
		this.default = listener;
	}

	public makeActive(listener: KeyboardListener) {
		this.active = listener;
	}

	public keydown(event: KeyboardEvent): void {
		this.prevent(event);

		if (this.active) {
			this.active.keydown(event);
		} else if (this.default) {
			this.default.keydown(event);
		} else {
			terminal.printerr(`KeyboardManager: no KeyboardListener found for ${event.key} (keydown)`);
		}
	}

	public keyup(event: KeyboardEvent): void {
		this.prevent(event);
		
		if (this.active) {
			this.active.keyup(event);
		} else if (this.default) {
			this.default.keyup(event);
		} else {
			terminal.printerr(`KeyboardManager: no KeyboardListener found for ${event.key} (keyup)`);
		}
	}

	public paste(event: ClipboardEvent): void {
		if (this.active) {
			this.active.paste(event);
		} else if (this.default) {
			this.default.paste(event);
		} else {
			terminal.printerr(`KeyboardManager: no KeyboardListener found for ${event.clipboardData} (paste)`);
		}
	}

	// Prevents the browser from overriding key actions for terminal (only tested with Firefox)
	public prevent(event: KeyboardEvent): void {
		switch (event.key) {
			case "/":
			case "'":
			case "Tab":
			case "ArrowUp":
			case "ArrowDown":
				event.preventDefault();
			case "ArrowLeft":
			case "ArrowRight":
				if (event.metaKey) {
					event.preventDefault();
				}
		}
	}
}

export const kbManager = new KeyboardManager();