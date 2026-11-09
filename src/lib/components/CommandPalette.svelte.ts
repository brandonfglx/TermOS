import { desktop } from "./listeners/Desktop.svelte.ts";
import { terminal } from "./listeners/Terminal.svelte.ts";
import { app as files } from "../applications/FilesApp.svelte.ts";
import { Directory, fileSystem } from "./FileSystem.svelte";

export type PaletteCategory = "Application" | "Command" | "File" | "Action";

export interface PaletteItem {
	id: string;
	label: string;
	desc: string;
	category: PaletteCategory;
	keywords?: string,
	run: () => void;
}

class CommandPalette {
	public open = $state(false);
	public query = $state("");
	public selectedIndex = $state(0);

	private catalog = $derived.by(() => this.buildCatalog());
	public results = $derived.by(() => this.filterItems(this.catalog, this.query));

	public openPalette(): void {
		this.open = true;
		this.query = "";
		this.selectedIndex = 0;
	}

	public close(): void {
		this.open = false;
		this.query = "";
		this.selectedIndex = 0;
	}

	public toggle(): void {
		if (this.open) {
			this.close();
		} else {
			this.openPalette();
		}
	}

	public setQuery(query: string): void {
		this.query = query;
		this.selectedIndex = 0;
	}

	public setSelectedIndex(index: number): void {
		this.selectedIndex = index;
	}

	public handleGlobalKeydown(event: KeyboardEvent): boolean {
		const modifier = event.metaKey || event.ctrlKey;
		const isToggleKey = event.code === "Space" || event.key.toLowerCase() === "k";
		
		if (modifier && isToggleKey) {
			event.preventDefault();
			this.toggle();
			return true;
		}

		return false;
	}

	public handleKeydown(event: KeyboardEvent): boolean {
		if (!this.open) {
			return false;
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				this.move(1);
				return true;
			case "ArrowUp":
				event.preventDefault();
				this.move(-1);
				return true;
			case "Home":
				event.preventDefault();
				this.selectedIndex = 0;
				return true;
			case "End":
				event.preventDefault();
				this.selectedIndex = Math.max(0, this.results.length - 1);
				return true;
			case "Enter":
				event.preventDefault();
				this.run();
				return true;
			case "Escape":
				event.preventDefault();
				this.close();
				return true;
			case "Tab":
				event.preventDefault();
				this.move(event.shiftKey ? -1 : 1);
				return true;
			default:
				return false;
		}
	}

	public run(index: number = this.selectedIndex): void {
		const item = this.results[index];
		if (!item) {
			return;
		}

		this.close();
		item.run();
	}

	private move(delta: number): void {
		if (this.results.length === 0) {
			return;
		}

		this.selectedIndex = (this.selectedIndex + delta + this.results.length) % this.results.length;
	}

	private runCommand(cmd: string): void {
		terminal.executeCommand(cmd);
	}

	private escapeArg(value: string): string {
		return value.replace(/([\\ ;])/g, "\\$1");
	}

	private buildCatalog(): PaletteItem[] {
		const items: PaletteItem[] = [];
		for (const [name, app] of desktop.getApps()) {
			items.push({
				id: `app:${name}`,
				label: name,
				desc: app.desc,
				category: "Application",
				keywords: "app application launch open",
				run: () => desktop.switchTo(app)
			});
		}

		for (const [name, command] of terminal.commands) {
			items.push({
				id: `cmd:${name}`,
				label: name,
				desc: command.desc,
				category: "Command",
				keywords: "command cmd terminal term run",
				run: () => this.runCommand(name)
			});
		}

		for (const [name, alias] of terminal.aliases) {
			items.push({
				id: `alias:${name}`,
				label: name,
				desc: `alias -> ${alias}`,
				category: "Command",
				keywords: "alias command cmd terminal term run",
				run: () => this.runCommand(name)
			});
		}

		const MAX_FILE_ITEMS = 500;
		let fileCount = 0;

		const walk = (dir: Directory): void => {
			for (const child of dir.getAll()) {
				if (fileCount >= MAX_FILE_ITEMS) {
					return;
				}

				fileCount++;

				if (child instanceof Directory) {
					items.push({
						id: `dir:${child.getPath()}`,
						label: child.getPath(),
						desc: "Directory",
						category: "File",
						keywords: "folder directory dir files",
						run: () => {
							files.cd(child.getPath(), new Map<string, string>());
							desktop.switchTo(files)
						}
					});

					walk(child);
				} else {
					items.push({
						id: `file:${child.getPath()}`,
						label: child.getPath(),
						desc: "File",
						category: "File",
						keywords: "file text open edit",
						run: () => this.runCommand(`text ${this.escapeArg(child.getPath())}`)
					});
				}
			}
		};

		walk(fileSystem.root);

		items.push(
			{
				id: "action:save-fs",
				label: "Save Filesystem",
				desc: "Save filesystem to localStorage",
				category: "Action",
				keywords: "settings storage save",
				run: () => files.save()
			},
			{
				id: "action:load-fs",
				label: "Load Filesystem",
				desc: "Loads filesystem from localStorage",
				category: "Action",
				keywords: "settings storage load",
				run: () => files.load()
			},
			{
				id: "action:clear-term",
				label: "Clear Terminal",
				desc: "Clears the terminal",
				category: "Action",
				keywords: "settings terminal term clear",
				run: () => terminal.clear()
			},
			{
				id: "action:quit",
				label: "Quit",
				desc: "Quits the current app",
				category: "Action",
				keywords: "settings app close quit",
				run: () => desktop.quit()
			}
		);

		return items;
	}

	private filterItems(items: PaletteItem[], query: string): PaletteItem[] {
		const q = query.trim().toLowerCase();
		if (q.length === 0) {
			return items.slice(0, 50);
		}

		const scored: { item: PaletteItem, score: number }[] = [];
		
		for (const item of items) {
			const label = item.label.toLowerCase();
			const desc = item.desc.toLowerCase();
			const cat = item.category.toLowerCase();
			const keywords = (item.keywords ?? "").toLowerCase();

			let score = Number.POSITIVE_INFINITY;
			if (label === q) {
				score = 0;
			} else if (label.startsWith(q)) {
				score = 1;
			} else if (label.includes(q)) {
				score = 2;
			} else if (cat.includes(q)) {
				score = 3;
			} else if (desc.includes(q)) {
				score = 4;
			} else if (keywords.includes(q)) {
				score = 5;
			}

			if (score !== Number.POSITIVE_INFINITY) {
				scored.push({ item, score });
			}
		}

		scored.sort((a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label));
		return scored.slice(0, 50).map(x => x.item);
	}
}

export const palette = new CommandPalette();