import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { app as term } from "./TerminalApp.svelte.ts";

// utcFetched returns UTC formatted string, while unixFetched returnst the unix time on the local machine
export interface LocationInfo {
	name: string,
	address: string,
	latitude: number,
	longitude: number,
	ipAddress: string | undefined,
	asnOrganization: string | undefined,
	utcFetched: string,
	unixFetched: number
}

class Location implements Command {
	public name: string = "loc";
	public desc: string = "prints info about the user's location or about the zip code"
	public evalOnLoad: string[] = [];

	public ipApi: string = "https://free.freeipapi.com/api/json";
	public zipApi: string = "https://api.zippopotam.us/us";
	public nominatimApi: string = "https://nominatim.openstreetmap.org/search";

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [zipCode?]`,
			"\tArgs:",
			"\t\tzipCode: US zip code to get info about"
		];
	}

	public async fetchLocs(input?: string): Promise<LocationInfo[]> {
		let locs: LocationInfo[] = [];

		if (input && /[0-9]{5}/.test(input)) {
			let response = await fetch(`${this.zipApi}/${input}`);
			if (!response || !response.ok) {
				return Promise.reject(new Error(`location: invalid zipcode: ${input}`));
			}

			let json = await response.json();
			let date = new Date();

			locs.push({
				name: json.places[0]["place name"],
				address: `${json.places[0]["place name"]}, ${json.places[0].state}, ${json.country}`,
				latitude: Number(json.places[0].latitude),
				longitude: Number(json.places[0].longitude),
				ipAddress: undefined,
				asnOrganization: undefined,
				utcFetched: date.toUTCString(),
				unixFetched: date.getDate()
			});
		} else if (input) {
			// Using OpenStreetMap Nominatim API; asks the user which location if there are multiple
			let response = await fetch(`${this.nominatimApi}?q=${encodeURIComponent(input)}&format=json`, {
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					"User-Agent": `TermOS/${term.getVersion()}`
				} 
			});
			if (!response || !response.ok) {
				return Promise.reject(new Error(`location: invalid location: ${input}`));
			}

			let json = await response.json();
			let date = new Date();

			for (const item of json) {
				locs.push({
					name: item.name,
					address: item.display_name,
					latitude: Number(item.lat),
					longitude: Number(item.lon),
					ipAddress: undefined,
					asnOrganization: undefined,
					utcFetched: date.toUTCString(),
					unixFetched: date.getDate()
				});
			}
		} else {
			let response = await fetch(this.ipApi);

			if (!response || !response.ok) {
				return Promise.reject(new Error("location: fetching ip api failed (likely rate limited)"));
			}

			let json = await response.json();
			let date = new Date();
			
			locs.push({
				name: json.cityName,
				address: `${json.cityName}, ${json.regionName}, ${json.countryName}`,
				latitude: json.latitude,
				longitude: json.longitude,
				ipAddress: json.ipAddress,
				asnOrganization: json.asnOrganization,
				utcFetched: date.toUTCString(),
				unixFetched: date.getDate()
			})
		}

		return locs;
	}

	public parseArgs(args: string[]): Map<string, string> {
		let map = new Map<string, string>();

		let etc = [];

		for (let arg of args) {
			// Only add "valid" zip codes
			if (/[0-9]{5}/.test(arg)) {
				map.set("zipCode", arg);
			} else {
				etc.push(arg);
			}
		}

		// Only keeps valid / non empty values
		etc = etc.filter(x => x.length > 0);
		if (etc.length > 0) {
			map.set("etc", etc.join(" "));
		}

		return map;
	}

	public async execute(args: Map<string, string>): Promise<void> {
		terminal.halt = true;

		try {
			let val = args.get("zipCode") ?? args.get("etc");
			let locs = await this.fetchLocs(val);

			for (let i = 0; i < locs.length; i++) {
				let loc = locs[i];

				let info = [
					`Name: ${loc.name}`,
					`Address: ${loc.address}`,
					`Latitude: ${loc.latitude}`,
					`Longitude: ${loc.longitude}`
				];

				if (!val) {
					info.push(
						"",
						`IP Address: ${loc.ipAddress}`,
						`ASN Organization: ${loc.asnOrganization}`
					);
				}

				info.push(
					"",
					`Fetched: ${new Date(loc.utcFetched).toLocaleString()}`
				);

				info.forEach((str) => {
					terminal.println(str);
				});

				// Seperate entries if needed
				if (i !== locs.length - 1) {
					terminal.println("---\n");
				}
			}
		} catch (e: any) {
			terminal.printerr(e);
		}

		terminal.halt = false;
	}
}

export const app = new Location();