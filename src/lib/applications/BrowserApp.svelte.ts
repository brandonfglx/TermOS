import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";

class BrowserApp implements Command, Application {
	public name: string = "browser";
	public desc: string = "barebones browser";
	public evalOnLoad: string[] = [];

	public defaultSearchEngine = "https://www.google.com/search?q=%s";

	public addressBar: HTMLInputElement | undefined;
	public frame: HTMLIFrameElement | undefined;
	public renderHTML: string = $state("");
	public src: string = $state("");
	
	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name}`,
		];
	}
	
	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		return map;
	}
	
	public execute(args: Map<string, string>): void {
		// Launch browser with settings (if applicable)
		if (args.size === 0) {
			desktop.switchTo(this);
		}
	}

	// Gets the URL when available; returns null otherwise
	public async go(): Promise<void> {
		if (!this.addressBar) {
			return;
		}

		try {
			let request = await fetch(`https://everyorigin.jwvbremen.nl/get?url=${this.parse(this.addressBar.value)}`);
			if (!request.ok) {
				return;
			}

			let data = await request.json();
			if (data.contents) {
				this.renderHTML = data.contents;
			}
		} catch (error) {
			terminal.printerr(`browser: encountered error through proxy: ${error}`);
			this.renderHTML = "";

			// Try rendering natively instead using src
			this.src = this.parse(this.addressBar.value);
		}
	}

	// Returns a parsed URL of the user's search request or requested URL
	// Parses search queries through the default search engine, and verifies URL validity
	// Invalid URLs are rejected
	public parse(input: string): string {
		// Strip out http:// or https:// (add back later after parsing)
		input = input.replaceAll("https://", "").replaceAll("http://", "");

		// Extract base URI from rest
		let cutoff = input.indexOf("/");
		if (cutoff === -1) {
			cutoff = input.length;
		}

		let base = input.substring(0, cutoff);
		let rest = input.substring(cutoff);

		// Check whether the URI matches an IP address (with or without port), basic URL format, or none (text query)
		if (base.match(/[0-9]{3}\.[0-9]{3}\.[0-9]\.[0-9](:[0-9]{1,5})?/i) ||
				base.match(/(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(?:ffff(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?[0-9])?[0-9])\.){3}(?:25[0-5]|(?:2[0-4]|1?[0-9])?[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?[0-9])?[0-9])\.){3}(?:25[0-5]|(?:2[0-4]|1?[0-9])?[0-9]))/i) ||
				base.match(/(?![0-9.]+\b)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,16}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i) ||
				base.match(/localhost(:[0-9]{1,5})?/i)) {
			// Use as direct URI
			return `https://${base}${rest}`;
		}
		
		return this.defaultSearchEngine.replace("%s", encodeURIComponent(input));
	}
	
	// Application methods

	public onAppShow(): void {
		
	}
	
	public onAppHide(): void {
		
	}
	
	public keydown(event: KeyboardEvent): void {
		switch (event.key) {
			case "q":
			case "c":
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

export const app = new BrowserApp();