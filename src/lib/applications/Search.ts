import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";

class Search implements Command {
	public name: string = "search";
	public desc: string = "search the web with any search engine";
	public evalOnLoad: string[] = [];

	public defaultFlag: string = "-g";

	// Default mappings
	private argMapping: Map<String, String> = new Map([
		["-g", "https://www.google.com/search?q=%s"],
		["--google", "https://www.google.com/search?q=%s"],
		["-ddg", "https://duckduckgo.com/?q=%s"],
		["--duck-duck-go", "https://duckduckgo.com/?q=%s"],
		["-yt", "https://www.youtube.com/results?search_query=%s"],
		["--youtube", "https://www.youtube.com/results?search_query=%s"],
		["-w", "https://en.wikipedia.org/wiki?search=%s"],
		["--wikipedia", "https://en.wikipedia.org/wiki?search=%s"],
		["-gai", "https://www.google.com/search?q=%s&udm=50"],
		["--google-ai", "https://www.google.com/search?q=%s&udm=50"]
	]);

	public help(args?: string[]): string[] {
		let help = [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} -- [args] | [tag] [query]`,
			"\tArgs:",
			`\t\targs: args to configure ${this.name}`,
			"\t\t\tdefault /t [tag]: change default search tag",
			"\t\t\tset /t [tag] /q [query]: sets the search engine with the given tag",
			"\t\t\trm /t [tag]: removes the search engine with the given tag",
			"\t\ttag: tag of site to search",
			"\t\tquery: text to search",
		];

		this.argMapping.forEach((val, key) => {
			help.push(`\t\t\t${key}: ${val}`);
		});

		return help;
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		if (args.length == 0) {
			map.set(this.defaultFlag, "");
			return map;
		}

		// Used to configure search command
		if (args[0] === "--") {
			if (args.length <= 2) {
				throw new Error("search: missing config parameter!");
			}

			let config = args[1];
			map.set("config", config);

			let currFlag = "";
			let currVal = "";

			for (let arg of args.slice(2)) {
				if (arg.startsWith("/")) {
					if (currFlag.length !== 0 && currVal.length !== 0) {
						map.set(currFlag, currVal);
					}

					currFlag = arg;
					currVal = "";
				} else {
					if (currVal.length === 0) {
						currVal = arg;
					} else {
						currVal += ` ${arg}`;
					}
				}
			}

			if (currFlag.length !== 0 && currVal.length !== 0) {
				map.set(currFlag, currVal);
			}

			return map;
		}

		let currFlag = "";
		let currVal = "";

		if (!args[0].startsWith("-")) {
			currFlag = this.defaultFlag;
		}

		for (let arg of args) {
			if (arg.startsWith("-")) {
				if (currFlag.length !== 0 && currVal.length !== 0) {
					map.set(currFlag, currVal);
				}

				currFlag = arg;
				currVal = "";
			} else {
				if (currVal.length === 0) {
					currVal = arg;
				} else {
					currVal += ` ${arg}`;
				}
			}
		}

		if (currFlag.length !== 0 && currVal.length !== 0) {
			map.set(currFlag, currVal);
		}

		return map;
	}

	public execute(args: Map<string, string>): void {
		let config = args.get("config");

		let tag = args.get("/t");
		let query = args.get("/q");

		// Change search configs
		if (config) {
			switch (config) {
				case "default":
					if (tag && this.argMapping.has(tag)) {
						this.defaultFlag = tag;
						terminal.println(`search: default tag is now: ${tag}`);
					} else {
						throw new Error(`search: invalid tag: ${tag}`);
					}
					break;
				case "set":
					if (tag && query) {
						this.argMapping.set(tag, query);
						terminal.println(`search: added search engine: ${tag} -> ${query}`);
					} else {
						throw new Error("search: invalid tag or query");
					}
					break;
				case "rm":
					if (tag && this.argMapping.delete(tag)) {
						terminal.println(`search: successfully deleted: ${tag}`);
					} else {
						throw new Error(`search: invalid tag: ${tag}`);
					}
					break;
				default:
					throw new Error(`search: invalid config: ${config}`);
			}
			
			return;
		}

		args.forEach((val, key) => {
			let url = this.argMapping.get(key);

			if (url) {
				window.open(url.replace("%s", encodeURIComponent(val)), "_blank");
			} else {
				throw new Error(`search: invalid search engine: ${key}`);
			}
		});
	}
}

export const app = new Search();