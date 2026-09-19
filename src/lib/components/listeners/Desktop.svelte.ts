import type { KeyboardListener } from "../KeyboardManager.svelte";

class Desktop implements KeyboardListener {
	public keydown(event: KeyboardEvent): void {
		
	}

	public keyup(event: KeyboardEvent): void {
		
	}

	public paste(event: ClipboardEvent): void {
		
	}
}

export const desktop = new Desktop();