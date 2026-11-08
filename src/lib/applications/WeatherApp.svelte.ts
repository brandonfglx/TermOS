import { desktop, type Application } from "$lib/components/listeners/Desktop.svelte";
import { terminal, type Command } from "$lib/components/listeners/Terminal.svelte";
import { app as location, type LocationInfo } from "./Location";
import { fetchWeatherApi } from "openmeteo";
import { WeatherApiResponse } from "@openmeteo/sdk/weather-api-response";
import type InputDialog from "$lib/utils/InputDialog.svelte";
import type InfoDialog from "$lib/utils/InfoDialog.svelte";
import type ErrorDialog from "$lib/utils/ErrorDialog.svelte";
import type ConfirmDialog from "$lib/utils/ConfirmDialog.svelte";
import { SvelteMap } from "svelte/reactivity";
import type { VariableWithValues } from "@openmeteo/sdk/variable-with-values";

interface WeatherParams {
	latitude: number,
	longitude: number,
	timezone: string,
	daily: string[],
	current: string[],
	temperature_unit: "celcius" | "fahrenheit",
	wind_speed_unit: "kmh" | "ms" | "mph" | "knots",
	precipitation_unit: "mm" | "inch",
	forecast_days: number
}

class WeatherApp implements Command, Application {
	public name: string = "weather";
	public desc: string = "shows the weather";
	public evalOnLoad: string[] = [];

	private weatherApi: string = "https://api.open-meteo.com/v1/forecast";

	public inputDialog = $state<ReturnType<typeof InputDialog> | null>(null);
	public infoDialog = $state<ReturnType<typeof InfoDialog> | null>(null);
	public errorDialog = $state<ReturnType<typeof ErrorDialog> | null>(null);
	public confirmDialog = $state<ReturnType<typeof ConfirmDialog> | null>(null);

	// Application variables
	public args = $state<SvelteMap<string, string> | null>(null);
	public info = $state(new SvelteMap<string, [LocationInfo, WeatherApiResponse]>());
	public loc = $state<LocationInfo | null>(null);
	public weather = $state<WeatherApiResponse | null>(null);
	public input = $state<string>("");

	// Based off of chart on open-mateo sdk ts/units.ts file
	public UNIT_TO_STRING: string[] = [
		"",
		"°C",
		"cm",
		"m³/m³",
		"m³/s",
		"°",
		"",
		"",
		"EAQI",
		"°F",
		"ft",
		"fraction",
		"GDD °C",
		"gpm",
		"grains/m³",
		"g/kg",
		"hPa",
		"h",
		"in",
		"", // ISO time standard
		"J/kg",
		"K",
		"kPa",
		"kg/m²",
		"km/h",
		"kn",
		"MJ/m²",
		"m/s",
		"m/s",
		"m",
		"μg/m³",
		"mph",
		"mm",
		"Pa",
		"1/s",
		"%",
		"s",
		"unixtime",
		"USAQI",
		"W/m²",
		"wmo code",
		"ppm",
		"kg/m³"
	];

	// Maximum number of days for weather forecast
	private MAX_DAYS = 16;

	// Maps arg flags to string id
	private argMapping: Map<string, string> = new Map([
		["-c", "cli"],
		["--cli", "cli"],
		["-z", "zipCode"],
		["--zip-code", "zipCode"],
		["-d", "days"],
		["--days", "days"]
	]);

	// Default values relating string id to default value
	private defaultArgs: Map<string, string> = new Map([
		["days", "3"]
	]);

	public help(args?: string[]): string[] {
		return [
			`${this.name}: ${this.desc}`,
			`\tUsage: weather [-c | --cli] | [ -z | --zipcode [zipCode] ] | [ -d | --days [days] ]`,
			`\tArgs:`,
			"\t\tcli?: outputs values to terminal instead of opening application",
			"\t\tzipcode?: US zip code to get weather for",
			"\t\tdays? (CLI only): # of forecast days to show (up to maximum in data)"
		];
	}
	
	public parseArgs(args: string[]): Map<string, string> {
		if (args.length === 0) {
			return this.defaultArgs;
		}

		let map = new Map<string, string>(this.defaultArgs);

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
					throw new Error(`weather: invalid argument: ${arg}`);
				}

				currVal = "";
			} else {
				switch (currFlag) {
					case "zipCode":
						// Only add "valid" zip codes
						if (/[0-9]{5}/.test(arg)) {
							currVal = arg;
						} else {
							throw new Error(`weather: invalid zip code: ${arg}`);
						}
						break;
					case "days":
						if (/[0-9]+/.test(arg)) {
							currVal = arg;
						} else {
							throw new Error(`weather: invalid days: ${arg}`);
						}
						break;
					default:
						throw new Error(`weather: unknown flag: ${currFlag}`);
				}
			}
		}

		if (currFlag.length !== 0) {
			map.set(currFlag, currVal);
		}

		return map;
	}

	public getWeatherParams(loc: LocationInfo, days: number): WeatherParams {
		if (days > this.MAX_DAYS) {
			throw new Error(`weather: exceeded maximum # of days: ${days} > ${this.MAX_DAYS}`);
		}

		return {
			latitude: loc.latitude,
			longitude: loc.longitude,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_probability_max", "visibility_mean", "wind_speed_10m_mean", "wind_gusts_10m_mean", "sunrise", "sunset", "uv_index_max", "precipitation_sum", "weather_code"],
			current: ["temperature_2m", "apparent_temperature", "wind_speed_10m", "wind_gusts_10m", "wind_direction_10m", "relative_humidity_2m", "precipitation", "weather_code"],
			temperature_unit: "fahrenheit",
			wind_speed_unit: "mph",
			precipitation_unit: "inch",
			forecast_days: days
		};
	}

	public async execute(args: SvelteMap<string, string>): Promise<void> {
		if (!args.has("cli")) {
			this.args = args;
			desktop.switchTo(this);
			return;
		}

		terminal.halt = true;

		let weatherResp; // WeatherApiResponse[]

		try {
			let locs = await location.fetchLocs(args.get("zipCode"));

			for (let i = 0; i < locs.length; i++) {
				let loc = locs[i];

				weatherResp = await fetchWeatherApi(this.weatherApi, this.getWeatherParams(loc, Number(args.get("days")!)));

				// Only process the first weather (maybe process others - controlled by flag?)
				let weather = weatherResp[0];
				let current = weather.current()!;
				let daily = weather.daily()!;

				let info: string[] = [
					`Weather Forecast For ${loc.name}:`
				];

				if (current) {
					info.push(
						`\tCurrent Weather (${new Date(Number(current.time()) * 1000).toLocaleString()}):`,
						`\t\tTemperature: ${current.variables(0)!.value().toFixed(0)}${this.UNIT_TO_STRING[current.variables(0)!.unit()]}`,
						`\t\tApparent Temperature: ${current.variables(1)!.value().toFixed(0)}${this.UNIT_TO_STRING[current.variables(1)!.unit()]}`,
						`\t\tWind Speed: ${current.variables(2)!.value().toFixed(0)} ${this.UNIT_TO_STRING[current.variables(2)!.unit()]}`,
						`\t\tWind Speed: ${current.variables(3)!.value().toFixed(0)} ${this.UNIT_TO_STRING[current.variables(3)!.unit()]}`,
						`\t\tWind Direction: ${current.variables(4)!.value().toFixed(0)}${this.UNIT_TO_STRING[current.variables(4)!.unit()]}`,
						`\t\tHumidity: ${current.variables(5)!.value().toFixed(0)}${this.UNIT_TO_STRING[current.variables(5)!.unit()]}`,
						`\t\tPrecipitation: ${current.variables(6)!.value().toFixed(0)} ${this.UNIT_TO_STRING[current.variables(6)!.unit()]}`,
						`\t\tCondition: ${this.getCondition(current.variables(7)!.value())}`
					);
				}
				
				if (daily) {
					for (let i = 0; i < daily.variables(0)!.valuesArray()!.length; i++) {
						info.push(
							`\tWeather for ${new Date(Number(daily.time()) + i * daily.interval() * 1000).toLocaleString()}:`,
							`\t\tMax Temperature: ${daily.variables(0)!.valuesArray()![i].toFixed(0)}${this.UNIT_TO_STRING[daily.variables(0)!.unit()]}`,
							`\t\tMin Temperature: ${daily.variables(1)!.valuesArray()![i].toFixed(0)}${this.UNIT_TO_STRING[daily.variables(1)!.unit()]}`,
							`\t\tPrecipitation Chance: ${daily.variables(2)!.valuesArray()![i].toFixed(0)}${this.UNIT_TO_STRING[daily.variables(2)!.unit()]}`,
							`\t\tVisibility: ${daily.variables(3)!.valuesArray()![i].toFixed(0)} ${this.UNIT_TO_STRING[daily.variables(3)!.unit()]}`,
							`\t\tWind Speed: ${daily.variables(4)!.valuesArray()![i].toFixed(0)} ${this.UNIT_TO_STRING[daily.variables(4)!.unit()]}`,
							`\t\tWind Gusts: ${daily.variables(5)!.valuesArray()![i].toFixed(0)} ${this.UNIT_TO_STRING[daily.variables(5)!.unit()]}`,
							`\t\tSunrise: ${new Date(Number(daily.variables(6)!.valuesInt64(i)) * 1000).toLocaleTimeString()}`,
							`\t\tSunrise: ${new Date(Number(daily.variables(7)!.valuesInt64(i)) * 1000).toLocaleTimeString()}`,
							`\t\tUV Index Max: ${daily.variables(8)!.valuesArray()![i].toFixed(0)}${this.UNIT_TO_STRING[daily.variables(8)!.unit()]}`,
							`\t\tPrecipitation Sum: ${daily.variables(9)!.valuesArray()![i].toFixed(0)}${this.UNIT_TO_STRING[daily.variables(9)!.unit()]}`,
							`\t\tCondition: ${this.getCondition(daily.variables(10)!.valuesArray()![i])}`
						)
					}
				}

				info.forEach((str) => {
					terminal.println(str);
				});

				if (i !== locs.length - 1) {
					terminal.println();
				}
			}
		} catch (e: any) {
			terminal.printerr(e);
		}

		terminal.halt = false;
	}

	public getCondition(code: number): string {
		if (code === 0) {
			return "Clear";
		} else if (code <= 2) {
			return "Partly Cloudy";
		} else if (code === 3) {
			return "Overcast";
		} else if (code === 45 || code == 48) {
			return "Fog";
		} else if (code >= 51 && code <= 57) {
			return "Drizzle";
		} else if (code >= 61 && code <= 67) {
			return "Rain";
		} else if (code >= 71 && code <= 77) {
			return "Snow";
		} else if (code >= 80 && code <= 82) {
			return "Showers";
		} else if (code >= 85 && code <= 86) {
			return "Snow Showers";
		} else if (code >= 95) {
			return "Thunderstorms";
		}

		return "Unknown";
	}

	// Application handlers

	public toKey(loc: LocationInfo): string {
		return JSON.stringify(loc);
	}

	// Adds whatever value is in input as a LocationInfo object to the array (if it's valid) and highlights it; no need to handle same location, since it will update the weather and location and change to it, which is expected behavior
	public async add(): Promise<void> {
		try {
			let locs = await location.fetchLocs(this.input);

			if (locs.length === 0) {
				throw new Error(`weather: location not found for "${this.input}"`);
			}

			let loc = locs[0];
			if (locs.length > 1) {
				// Make the user choose which location to use
				let index = Number(await this.inputDialog?.ask({
					prompt: "Choose a Location (Enter location #)",
					description: locs.map((x, index) => `${index + 1}: ${x.address}`).join("\n")
				}));;

				// Exit on invalid input
				if (!index || index < 1 || index > locs.length) {
					await this.errorDialog?.error({
						title: "Invalid Location",
						content: `${index} is not within the valid range of [1, ${locs.length}]`
					});
					return;
				}

				loc = locs[--index];
			}

			let weather = await fetchWeatherApi(this.weatherApi, this.getWeatherParams(loc, Number(this.args?.get("days"))));
			this.info.set(this.toKey(loc), [loc, weather[0]]);
			this.loc = loc;
			this.weather = weather[0];

			this.input = "";
		} catch {
			if (Number(this.args?.get("days")) > this.MAX_DAYS) {
				await this.errorDialog?.error({
					title: "Exceeded Forecast Days Maximum",
					content: `${this.args?.get("days")} days is greater than the maximum permissible value of ${this.MAX_DAYS} days.\nThe app will close once this prompt is closed.`
				});
				desktop.quit(); // Automatically exit app.
				return;
			}

			this.errorDialog?.error({
				title: "Weather Error",
				content: `An error occurred when trying to get the weather for "${this.input}"`
			});
		}
	}

	public remove(loc: LocationInfo): void {
		let rem = this.loc && this.toKey(this.loc) === this.toKey(loc);
		this.info.delete(this.toKey(loc));
		if (rem) {
			let item = this.info.entries().next().value?.[1];
			this.loc = item?.[0] ?? null;
			this.weather = item?.[1] ?? null;
		}
	}

	// Updates the weather value for all loc-weather pairs (does not change active weather until successfully finished)
	public async refresh(): Promise<void> {
		try {
			for (const [loc, _] of this.info.values()) {
				let weather = await fetchWeatherApi(this.weatherApi, this.getWeatherParams(loc, Number(this.args?.get("days"))));
				this.info.set(this.toKey(loc), [loc, weather[0]]);
			}
		} catch {
			this.errorDialog?.error({
				title: "Refresh Error",
				content: "An error occurred when refreshing weather entries."
			});
		}

		let addBack = false;
		if (!this.loc) {
			let attemptLoc = this.info.entries().next().value?.[1][0];
			if (!attemptLoc) {
				this.loc = (await location.fetchLocs())[0];
				addBack = true;
			} else {
				this.loc = attemptLoc;
			}
		}

		if (addBack) {
			let weather = await fetchWeatherApi(this.weatherApi, this.getWeatherParams(this.loc, Number(this.args?.get("days"))));
			this.info.set(this.toKey(this.loc), [this.loc, weather[0]]);
			return;
		}

		let weather = this.info.get(this.toKey(this.loc))?.[1];
		if (!weather) {
			weather = (await fetchWeatherApi(this.weatherApi, this.getWeatherParams(this.loc, Number(this.args?.get("days")))))[0];
			this.info.set(this.toKey(this.loc), [this.loc, weather]);
		}

		this.weather = weather;
	}

	// Displays the weather for the location at the given index relative to the locs array
	public goTo(loc: LocationInfo): void {
		let weather = this.info.get(this.toKey(loc))?.[1];
		if (!weather) {
			this.errorDialog?.error({
				title: "Weather Error",
				content: `An error occurred when trying to go to ${loc}`
			});
			return;
		}

		this.loc = loc;
		this.weather = weather;
	}

	public getWeatherVar(num: number): VariableWithValues | null {
		return this.weather?.current()?.variables(num) ?? null;
	}

	public async onAppShow(): Promise<void> {
		// Calculate information (like passed in zip code) as needed
		if (!Number(this.args?.get("days"))) {
			return;
		}

		let zipCode = this.args?.get("zipCode");

		if (zipCode) {
			this.input = zipCode;
		}

		if (zipCode || this.info.size === 0) {
			this.add();
		} else {
			let item = this.info.entries().next().value?.[1];
			this.loc = item?.[0] ?? null;
			this.weather = item?.[1] ?? null;
		}

		if (this.weather) {
			this.refresh();
		}
	}

	public onAppHide(): void {
		
	}

	public keydown(event: KeyboardEvent): void {
		switch (event.key) {
			case "q":
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

export const app = new WeatherApp();