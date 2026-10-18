// Manages how the website handles key inputs
// Some keybinds are always attributed to a component (eg ctrl + ` for switching btwn apps)
// 		otherwise, keys are directed to the "active" element - the "active" element is determined as the last component that calls for the keyboard manager to focus on it

export interface KeyboardListener {
	keydown(event: KeyboardEvent): void;
	keyup(event: KeyboardEvent): void;
	paste(event: ClipboardEvent): void;
}

// Ironically, the KeyboardManager is also a KeyboardListener, but has the power to direct controls
export class KeyboardManager implements KeyboardListener {
	private default: KeyboardListener | null = null;
	private active: KeyboardListener | null = null;

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
			throw new Error(`KeyboardManager: no KeyboardListener found for ${event.key} (keydown)`);
		}
	}

	public keyup(event: KeyboardEvent): void {
		this.prevent(event);
		
		if (this.active) {
			this.active.keyup(event);
		} else if (this.default) {
			this.default.keyup(event);
		} else {
			throw new Error(`KeyboardManager: no KeyboardListener found for ${event.key} (keyup)`);
		}
	}

	public paste(event: ClipboardEvent): void {
		if (this.active) {
			this.active.paste(event);
		} else if (this.default) {
			this.default.paste(event);
		} else {
			throw new Error(`KeyboardManager: no KeyboardListener found for ${event.clipboardData} (paste)`);
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