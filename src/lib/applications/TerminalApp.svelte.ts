import { kbManager } from "$lib/components/KeyboardManager.svelte";
import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { HeaderMenu, Header } from "$lib/components/Header.svelte";
import type ErrorDialog from "$lib/utils/ErrorDialog.svelte";
import type InfoDialog from "$lib/utils/InfoDialog.svelte";
import InputDialog from "$lib/utils/InputDialog.svelte";
import ConfirmDialog from "$lib/utils/ConfirmDialog.svelte";

class TerminalApp implements Command, Application {
	public name: string = "term";
	public desc: string = "core terminal for TermOS";
	public evalOnLoad: string[] = [];

	public inputDialog = $state<ReturnType<typeof InputDialog> | null>(null);
	public infoDialog = $state<ReturnType<typeof InfoDialog> | null>(null);
	public errorDialog = $state<ReturnType<typeof ErrorDialog> | null>(null);
	public confirmDialog = $state<ReturnType<typeof ConfirmDialog> | null>(null);

	public header: Header = new Header()
		.setLeft([
			// None yet...
		])
		.setRight([
			new HeaderMenu("Terminal")
				.add("About", () => {
					this.infoDialog?.log({
						title: `About ${this.name} (${this.getVersion()})`,
						content: this.help().join("\n") + `\n\nTermOS © ${new Date().getFullYear()} brandonfglx\nTermOS is licensed under the GNU General Public License Version 3.\nTermOS source code is available at https://www.github.com/brandonfglx/TermOS`
					})
				})
		]);

	public getVersion(): string {
		return "v0.0.11";
	}

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name}`,
			"\t\tOpens the terminal window"
		]
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		if (args.length === 0) {
			return map;
		}

		return map;
	}
	
	// Allow users to change settings through here; maybe bring up a settings page?
	public execute(args: Map<string, string>): void {
		// Show terminal when no args are provided
		if (args.size === 0) {
			desktop.switchTo(this);
		}
	}

	// Application handlers

	public onAppShow(): void {
		kbManager.makeActive(terminal);
	}

	public onAppHide(): void {
		
	}

	// Pass terminal events back to the terminal bar (even though the kbManager directs key input here)
	public keydown(event: KeyboardEvent): void {
		terminal.keydown(event);
	}

	public keyup(event: KeyboardEvent): void {
		terminal.keyup(event);
	}

	public paste(event: ClipboardEvent): void {
		terminal.paste(event);
	}

	public onFocusGain(): void {
		kbManager.makeActive(terminal);
	}

	public onFocusLost(): void {
		
	}
}

export const app = new TerminalApp();