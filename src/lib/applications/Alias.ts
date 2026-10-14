import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";

// Although aliases are built into the terminal, this command allows users to manage them.
class Alias implements Command {
	public name: string = "alias";
	public desc: string = "toggles aliases to commands; aliases are used if a command doesn't exist";
	public joiner: string = "_";
	
	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [name] [cmd]`,
			"\tArgs:",
			`\t\tname: name of alias (cannot have spaces); if it already exists, the cmd is overwritten`,
			"\t\tcmd: entire command with args to assign alias to; if empty, the alias is deleted",
			`\tIf no args are provided, ${this.name} prints all aliases to the terminal.`
		];
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		if (args.length > 0) {
			map.set("name", args[0]);

			if (args.length > 1) {
				map.set("cmd", args.slice(1).join(" "));
			}
		}

		return map;
	}

	public execute(args: Map<string, string>): void {
		let name = args.get("name");
		let cmd = args.get("cmd");

		if (!name) {
			if (terminal.aliases.size === 0) {
				terminal.println("alias: there are no aliases defined!");
				return;
			}

			terminal.println("Defined aliases:");
			terminal.aliases.forEach((cmd, name) => {
				terminal.println(`\t${name}: ${cmd}`);
			});

			return;
		}

		if (!cmd) {
			if (terminal.aliases.delete(name)) {
				terminal.println(`alias: deleted \"${name}\"`);
			} else {
				throw new Error(`alias: alias \"${name}\" doesn't exist!`);
			}

			return;
		}

		terminal.aliases.set(name, cmd);
		terminal.println(`alias: created alias \"${name}\" -> \"${cmd}\"`);
	}
	
	// Command handlers

	public onCmdLoad(): void {
		
	}
}

export const app = new Alias();