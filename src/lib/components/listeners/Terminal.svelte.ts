import { SvelteMap } from "svelte/reactivity";
import { kbManager, type KeyboardListener } from "../KeyboardManager.svelte";

class Terminal implements KeyboardListener {
	public input: string = $state("");
	public inputIndex: number = $state(0);
	private historyIndex: number = 0;
	private inputHistory = $state<string[]>([]);

	public history = $state<SvelteMap<string, string>[]>([]);
	private commands = $state(new SvelteMap<string, Command>());

	public halt: boolean = false;
	public prefix: string = "guest@TermOS % ";

	constructor() {
		kbManager.makeDefault(this);
		this.loadCommands();
	}

	public loadCommands(): void {
		const modules = import.meta.glob("$lib/applications/*.ts", { eager: true });

		for (const path in modules) {
			const command = (modules[path] as any).app; // NOTE: All commands must export a const named 'app'
			this.commands.set(command.name, command);
		}
	}

	public keydown(event: KeyboardEvent): void {
		if (this.halt) {
			return;
		}

		switch (event.key) {
			case "Enter":
				this.historyIndex = 0;
				this.inputIndex = 0;
				this.execute();
				break;
			case "Backspace":
				if (this.input.length === 0) {
					return;
				}

				if (event.metaKey) {
					this.input = this.input.substring(this.inputIndex);
					this.inputIndex = 0;
				} else if (event.altKey) {
					let index = Math.max(0, this.input.lastIndexOf(" ", this.inputIndex - 1));

					this.input = this.input.substring(0, index) + this.input.substring(this.inputIndex);
					this.inputIndex -= this.inputIndex - index;
				} else if (this.inputIndex !== 0) {
					this.input = this.input.substring(0, this.inputIndex - 1) + this.input.substring(this.inputIndex + 1);
					this.inputIndex--;
				}
				break;
			case "ArrowUp":
				this.historyIndex = Math.max(Math.min(this.historyIndex - 1, 0), -this.inputHistory.length);

				this.input = this.inputHistory[this.inputHistory.length + this.historyIndex];
				this.inputIndex = Math.max(0, Math.min(this.inputIndex, this.input.length));
				break;
			case "ArrowDown":
				this.historyIndex = Math.max(Math.min(this.historyIndex + 1, 0), -this.inputHistory.length);

				if (this.historyIndex === 0) {
					this.input = "";
				} else {
					this.input = this.inputHistory[this.inputHistory.length + this.historyIndex];
				}

				this.inputIndex = Math.max(0, Math.min(this.inputIndex, this.input.length));
				break;
			case "ArrowLeft":
				if (event.metaKey) {
					this.inputIndex = 0;
				} else if (event.altKey) {
					this.inputIndex = Math.max(0, this.input.lastIndexOf(" ", this.inputIndex - 1));
				} else {
					this.inputIndex = Math.max(0, Math.min(this.inputIndex - 1, this.input.length));
				}
				break;
			case "ArrowRight":
				if (event.metaKey) {
					this.inputIndex = this.input.length;
				} else if (event.altKey) {
					this.inputIndex = this.input.indexOf(" ", this.inputIndex + 1) === -1 ? this.input.length : this.input.indexOf(" ", this.inputIndex + 1);
				} else {
					this.inputIndex = Math.max(0, Math.min(this.inputIndex + 1, this.input.length));
				}
				break;
			default:
				let key = event.key;

				if (event.key === "Tab") {
					key = "\t";
				}

				if (!event.metaKey && !event.ctrlKey && key !== "Alt" && key !== "Shift" &&
						key !== "Escape" && key !== "CapsLock" && key !== "Dead" && 
						!/F[1-9][0-9]?/g.test(key)) {
					this.input = this.input.substring(0, this.inputIndex) + key + this.input.substring(this.inputIndex);
					this.inputIndex++;
				}
				break;
		}
	}
	
	public keyup(event: KeyboardEvent): void {
		if (this.halt) {
			return;
		}
	}

	public paste(event: ClipboardEvent): void {
		
	}

	public println(str: string = "\0"): void {
		if (str.length === 0) {
			str = "\0";
		}

		this.history.push(new SvelteMap<string, string>([
			["text-light-fg dark:text-dark-fg", str]
		]));
	}

	public printerr(str: string = "\0"): void {
		if (str.length === 0) {
			str = "\0";
		}

		this.history.push(new SvelteMap<string, string>([
			["text-red-500", str]
		]));
	}

	public execute(): void {
		if (this.input.length > 0) {
			this.inputHistory.push(this.input);
		}

		this.history.push(new SvelteMap<string, string>([
			["text-light-fg dark:text-dark-fg", this.prefix + this.input]
		]));

		this.executeCommand(this.input);
		this.input = "";
	}

	public executeCommand(input: string): boolean {
		let arr = input.trim().split(" ");
		let cmdRaw = arr.at(0);

		if (!cmdRaw || cmdRaw.length === 0) {
			return false;
		}

		let cmd = this.commands.get(cmdRaw);

		if (cmd) {
			try {
				cmd.execute(cmd.parseArgs(arr.slice(1)));
			} catch (e: any) {
				this.printerr(e);
				return false;
			}
		} else {
			this.printerr(`TermOS: command not found: ${cmdRaw}`);
			return false;
		}

		return true;
	}
}

export interface Command {
	name: string,
	desc: string,
	help(args?: string[]): string[],
	parseArgs(args: string[]): Map<string, string>,
	execute(args: Map<string, string>): void
}

export const terminal = new Terminal();