import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import { HeaderMenu, Header } from "$lib/components/Header.svelte";
import type InputDialog from "$lib/utils/InputDialog.svelte";
import type InfoDialog from "$lib/utils/InfoDialog.svelte";
import type ErrorDialog from "$lib/utils/ErrorDialog.svelte";

class BrowserApp implements Command, Application {
	public name: string = "browser";
	public desc: string = "barebones browser";
	public header: Header = new Header()
		.setLeft([
			new HeaderMenu("Options")
				.add("Go Home", () => this.goTo(this.defaultWebsite))
		]).setRight([
			new HeaderMenu("Browser")
				.add("About", () => {
					this.infoDialog?.log({
						title: `About ${this.name}`,
						content: this.help().join("\n")
					})
				})
				.add("Quit", () => desktop.quit())
		]);
	public evalOnLoad: string[] = [];

	public defaultWebsite = "https://brandonfglx.github.io/TermOS";
	public defaultSearchEngine = "https://www.google.com/search?q=%s";

	public addressBar: HTMLInputElement | undefined;
	public frame: HTMLIFrameElement | undefined;
	public renderHTML: string = $state("");
	public src: string = $state("");

	public inputDialog = $state<ReturnType<typeof InputDialog> | null>(null);
	public infoDialog = $state<ReturnType<typeof InfoDialog> | null>(null);
	public errorDialog = $state<ReturnType<typeof ErrorDialog> | null>(null);

	// Maps arg flags to string id
	private argMapping: Map<string, string> = new Map([
		["-s", "silent"],
		["--silent", "silent"],
		["-d", "default"],
		["--default", "default"],
	]);
	
	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [-s] | [-d | --default [URL]]`,
			"\tArgs:",
			"\t\t-s | --slient: do not open browser app (usually used just to set config and not open browser)",
			"\t\t-d | --default [URL]: sets the default webpage (or homepage) to the given URL"
		];
	}
	
	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		let currFlag = "";
		let currVal = "";

		for (let arg of args) {
			if (arg.startsWith("-")) {
				if (currFlag.length !== 0) {
					map.set(currFlag, currVal);
				}

				let mapped = this.argMapping.get(arg);

				if (mapped) {
					currFlag = mapped;
				} else {
					throw new Error(`browser: invalid argument: ${arg}`);
				}

				currVal = "";
			} else {
				switch (currFlag) {
					case "default":
						if (this.parse(arg).replace("https://", "").replace("http://", "") === arg) {
							currVal = arg;
						} else {
							throw new Error(`browser: invalid default url: ${arg} -> got ${this.parse(arg)}`);
						}
						break;
					case "silent":
						// Do nothing
						break;
					default:
						throw new Error(`browser: unknown flag: ${currFlag}`);
				}
			}
		}

		if (currFlag.length !== 0) {
			map.set(currFlag, currVal);
		}

		return map;
	}
	
	public execute(args: Map<string, string>): void {
		if (args.has("default")) {
			this.defaultWebsite = args.get("default")!;
		}

		// Launch browser with settings (if applicable)
		if (!args.has("silent")) {
			desktop.switchTo(this);
		}
	}

	// Goes to the URL based on the input in the address bar
	public go(): void {
		if (this.addressBar) {
			this.goTo(this.addressBar.value);
		}
	}

	// Goes to the URL based on the passed in string
	public async goTo(url: string): Promise<void> {
		try {
			let request = await fetch(`https://everyorigin.jwvbremen.nl/get?url=${this.parse(url)}`);
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
			this.src = this.parse(url);
		}

		if (this.addressBar) {
			this.addressBar.value = this.src;
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