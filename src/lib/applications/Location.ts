import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";

// utcFetched returns UTC formatted string, while unixFetched returnst the unix time on the local machine
export interface LocationInfo {
	cityName: string,
	regionCode: string,
	regionName: string,
	countryCode: string,
	countryName: string,
	zipCode: string,
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

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: ${this.name} [zipCode?]`,
			"\tArgs:",
			"\t\tzipCode: US zip code to get info about"
		];
	}

	public async fetchLoc(input?: string): Promise<LocationInfo> {
		let loc: LocationInfo;

		if (input && /[0-9]{5}/.test(input)) {
			let response = await fetch(`${this.zipApi}/${input}`);
			if (!response || !response.ok) {
				return Promise.reject(new Error(`location: invalid zipcode: ${input}`));
			}

			let json = await response.json();
			let date = new Date();

			loc = {
				cityName: json.places[0]["place name"],
				regionCode: json.places[0]["state abbreviation"],
				regionName: json.places[0].state,
				countryCode: json["country abbreviation"],
				countryName: json.country,
				zipCode: json["post code"],
				latitude: Number(json.places[0].latitude),
				longitude: Number(json.places[0].longitude),
				ipAddress: undefined,
				asnOrganization: undefined,
				utcFetched: date.toUTCString(),
				unixFetched: date.getDate()
			};
		} else if (input) {
			// This is a very shaky algorithm, so do not rely on it working half of the time
			let city = input.replaceAll(",", "").substring(0, input.lastIndexOf(" "));
			let state = input.replaceAll(",", "").substring(input.lastIndexOf(" ") + 1);

			let response = await fetch(`${this.zipApi}/${state}/${city}`);
			if (!response || !response.ok) {
				return Promise.reject(new Error(`location: cannot parse with city = ${city} and state = ${state}`));
			}

			let json = await response.json();
			let lat = 0;
			let long = 0;
			let median = json.places[Math.floor(json.places.length / 2)];
			
			// Average out all the points given
			for (const place of json.places) {
				lat += Number(place.latitude)
				long += Number(place.longitude)
			}

			lat /= json.places.length;
			long /= json.places.length;

			let date = new Date();

			loc = {
				cityName: median["place name"],
				regionCode: json["state abbreviation"],
				regionName: json.state,
				countryCode: json["country abbreviation"],
				countryName: json.country,
				zipCode: median["post code"],
				latitude: lat,
				longitude: long,
				ipAddress: undefined,
				asnOrganization: undefined,
				utcFetched: date.toUTCString(),
				unixFetched: date.getDate()
			}
		} else {
			let response = await fetch(this.ipApi);

			if (!response || !response.ok) {
				return Promise.reject(new Error("location: fetching ip api failed (likely rate limited)"));
			}

			loc = await response.json();

			let date = new Date();
			loc.utcFetched = date.toUTCString();
			loc.unixFetched = date.getDate();
		}

		return loc;
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
			let loc = await this.fetchLoc(val);

			let info = [
				`City: ${loc.cityName}`,
				`Region: ${loc.regionName} (${loc.regionCode})`,
				`Country: ${loc.countryName} (${loc.countryCode})`,
				`Zip Code: ${loc.zipCode}`,
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
		} catch (e: any) {
			terminal.printerr(e);
		}

		terminal.halt = false;
	}
}

export const app = new Location();