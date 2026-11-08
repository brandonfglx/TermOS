<script lang="ts">
	import { app as weather } from "./WeatherApp.svelte.ts";
	import InputDialog from "$lib/utils/InputDialog.svelte";
	import InfoDialog from "$lib/utils/InfoDialog.svelte";
	import ErrorDialog from "$lib/utils/ErrorDialog.svelte";
    import ConfirmDialog from "$lib/utils/ConfirmDialog.svelte";
</script>

<div class="relative h-full w-full">
	<div class="h-full w-full overflow-y-auto flex flex-row font-mono text-base">
		<div class="h-full min-h-0 w-auto min-w-0 p-2 overflow-hidden flex-1/4 flex flex-col gap-2 bg-[#f0f0f0] dark:bg-[#101010]">
			<div class="shrink-0 min-w-0 flex flex-row flex-wrap gap-2 p-2 bg-[#d8d8d8] dark:bg-[#222222]">
				<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Refresh" onclick={() => weather.refresh()}>
					<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M23,12A11,11,0,1,1,12,1a10.9,10.9,0,0,1,5.882,1.7l1.411-1.411A1,1,0,0,1,21,2V6a1,1,0,0,1-1,1H16a1,1,0,0,1-.707-1.707L16.42,4.166A8.9,8.9,0,0,0,12,3a9,9,0,1,0,9,9,1,1,0,0,1,2,0Z"/>
					</svg>
				</button>
				<input
					type="text"
					placeholder="Enter Zip Code or City and State"
					class="bg-term-light-bg dark:bg-term-dark-bg min-w-0 flex-1 border-none outline-none focus:outline-none focus:ring-0"
					bind:value={weather.input}
					onkeydown={(event) => {
						if (event.key === "Enter") {
							weather.add();
						}
					}}
				/>
				<button class="w-8 shrink-0 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Add" onclick={() => {weather.add()}}>
					<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<rect data-name="--Rectangle" fill="none" height="20" id="_--Rectangle" rx="2" ry="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="20" x="2" y="2"/>
						<line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="15.5" x2="8.5" y1="12" y2="12"/>
						<line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="15.5" y2="8.5"/>
					</svg>
				</button>
			</div>
			<div class="flex-1 min-h-0 min-w-0 flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
				{#each weather.info.values() as item}
					<div class="flex flex-row gap-2 p-2 bg-term-light-bg dark:bg-term-dark-bg justify-center items-center min-w-0">
						<button class="flex-1 min-w-0 cursor-pointer bg-transparent border-none p-0 flex items-center text-left" aria-label={item[0].address} onclick={() => weather.goTo(item[0])}>
							<div class="title-clip w-full min-w-0 overflow-hidden">
								<h1 class="title-marquee w-max whitespace-nowrap" title={`${item[0].latitude}, ${item[0].longitude}`}>
									{item[0].name}
								</h1>
							</div>
						</button>
						<button class="w-8 shrink-0 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Remove" onclick={() => {weather.remove(item[0])}}>
							<svg fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
								<path d="M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048zM9.76 20.256q0 0.832 0.576 1.408t1.44 0.608 1.408-0.608l2.816-2.816 2.816 2.816q0.576 0.608 1.408 0.608t1.44-0.608 0.576-1.408-0.576-1.408l-2.848-2.848 2.848-2.816q0.576-0.576 0.576-1.408t-0.576-1.408-1.44-0.608-1.408 0.608l-2.816 2.816-2.816-2.816q-0.576-0.608-1.408-0.608t-1.44 0.608-0.576 1.408 0.576 1.408l2.848 2.816-2.848 2.848q-0.576 0.576-0.576 1.408z"></path>
							</svg>
						</button>
					</div>
				{/each}
			</div>
		</div>
		<div class="h-full flex-3/4 flex flex-col overflow-y-auto">
			{#if !weather.loc || !weather.weather}
				<div class="flex-1 flex flex-col gap-4 justify-center items-center">
					<svg class="w-24" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
						<path d="M6,0C2.6862793,0,0,2.6862793,0,6s2.6862793,6,6,6s6-2.6862793,6-6S9.3137207,0,6,0z M6.5,9.5h-1v-1h1V9.5z   M7.2651367,6.1738281C6.7329102,6.5068359,6.5,6.6845703,6.5,7v0.5h-1V7c0-0.9023438,0.7138672-1.3486328,1.2348633-1.6738281  C7.2670898,4.9931641,7.5,4.8154297,7.5,4.5c0-0.5517578-0.4487305-1-1-1h-1c-0.5512695,0-1,0.4482422-1,1V5h-1V4.5  c0-1.1025391,0.8969727-2,2-2h1c1.1030273,0,2,0.8974609,2,2C8.5,5.4023438,7.7861328,5.8486328,7.2651367,6.1738281z" fill="currentColor"/>
					</svg>
					<h1 class="text-2xl text-center">Location Not Found</h1>
				</div>
			{:else if !Number(weather.args?.get("days"))}
				<div class="flex-1 flex flex-col gap-4 justify-center items-center">
					<svg class="w-24" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
						<path d="M6,0C2.6862793,0,0,2.6862793,0,6s2.6862793,6,6,6s6-2.6862793,6-6S9.3137207,0,6,0z M6.5,9.5h-1v-1h1V9.5z   M7.2651367,6.1738281C6.7329102,6.5068359,6.5,6.6845703,6.5,7v0.5h-1V7c0-0.9023438,0.7138672-1.3486328,1.2348633-1.6738281  C7.2670898,4.9931641,7.5,4.8154297,7.5,4.5c0-0.5517578-0.4487305-1-1-1h-1c-0.5512695,0-1,0.4482422-1,1V5h-1V4.5  c0-1.1025391,0.8969727-2,2-2h1c1.1030273,0,2,0.8974609,2,2C8.5,5.4023438,7.7861328,5.8486328,7.2651367,6.1738281z" fill="currentColor"/>
					</svg>
					<h1 class="text-2xl text-center">Cannot Find Weather With a Time Period of {weather.args?.get("days")} Days</h1>
				</div>
			{:else}
				<div class="w-full p-8 flex flex-col justify-center items-center">
					<p class="" title={weather.loc.address}>{weather.loc.name}</p>
					<p class="text-6xl p-1">{`${weather.getWeatherVar(0)!.value().toFixed(0)}${weather.UNIT_TO_STRING[weather.getWeatherVar(0)!.unit()]}`}</p>
					<p class="text-xl">{`${weather.getCondition(weather.getWeatherVar(7)!.value())}`}</p>
				</div>

				{@const current = weather.weather.current()!}
				{@const daily = weather.weather.daily()!}
				{@const tempUnit = weather.UNIT_TO_STRING[daily.variables(0)!.unit()]}
				{@const windUnit = weather.UNIT_TO_STRING[current.variables(2)!.unit()]}
				{@const humidityUnit = weather.UNIT_TO_STRING[current.variables(5)!.unit()]}
				{@const precipUnit = weather.UNIT_TO_STRING[current.variables(6)!.unit()]}
				{@const compass = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]}
				{@const windDir = compass[Math.round(current.variables(4)!.value() / 22.5) % 16]}
				{@const toDate = (seconds: number | bigint) => new Date(Number(seconds) * 1000)}

				<div class="w-full p-2 flex flex-col gap-4">
					<div class="">
						<section class="w-full flex flex-col">
							<div class="flex justify-between gap-2 mb-1">
								<p class="">Current Conditions</p>
								<p class="">Last Updated: {toDate(current.time()).toLocaleTimeString()}</p>
							</div>
						</section>
						<section class="grid grid-cols-2 lg:grid-cols-3 gap-px bg-separator-light dark:bg-separator-dark">
							<div class="bg-term-light-bg dark:bg-term-dark-bg px-3 py-2 flex flex-col gap-1">
								<span class="">High / Low</span>
								<span>{daily.variables(0)!.valuesArray()![0].toFixed(0)}{tempUnit} / {daily.variables(1)!.valuesArray()![0].toFixed(0)}{tempUnit}</span>
							</div>
							<div class="bg-term-light-bg dark:bg-term-dark-bg px-3 py-2 flex flex-col gap-1">
								<span class="">Wind</span>
								<span>{Number(daily.variables(2)!.value().toFixed(0)) === 0 ? "" : windDir} {daily.variables(2)!.value().toFixed(0)} {windUnit}</span>
							</div>
							<div class="bg-term-light-bg dark:bg-term-dark-bg px-3 py-2 flex flex-col gap-1">
								<span class="">Gusts</span>
								<span>{daily.variables(3)!.value().toFixed(0)} {windUnit}</span>
							</div>
							<div class="bg-term-light-bg dark:bg-term-dark-bg px-3 py-2 flex flex-col gap-1">
								<span class="">Humidity</span>
								<span>{current.variables(5)!.value().toFixed(0)}{humidityUnit}</span>
							</div>
							<div class="bg-term-light-bg dark:bg-term-dark-bg px-3 py-2 flex flex-col gap-1">
								<span class="">Precipitation</span>
								<span>{current.variables(6)!.value().toFixed(2)} {precipUnit}</span>
							</div>
							<div class="bg-term-light-bg dark:bg-term-dark-bg px-3 py-2 flex flex-col gap-1">
								<p class="">Sunrise: {toDate(daily.variables(6)!.valuesInt64(0)!).toLocaleTimeString()}</p>
								<p class="">Sunset: {toDate(daily.variables(7)!.valuesInt64(0)!).toLocaleTimeString()}</p>
							</div>
						</section>
					</div>
					<section class="w-full flex flex-col">
						<div class="flex justify-between gap-2 mb-1">
							<p class="">Forecast</p>
							<p class="">{daily.variables(0)?.valuesLength() ?? 0} days</p>
						</div>
						<div class="flex flex-row flex-wrap gap-2">
							{#each daily.variables(0)!.valuesArray()! as high, i}
								{@const low = daily.variables(1)!.valuesArray()![i]}
								{@const rain = daily.variables(2)!.valuesArray()![i]}
								{@const rainUnit = weather.UNIT_TO_STRING[daily.variables(2)!.unit()]}
								{@const visibility = daily.variables(3)!.valuesArray()![i]}
								{@const visibilityUnit = weather.UNIT_TO_STRING[daily.variables(3)!.unit()]}
								{@const wind = daily.variables(4)!.valuesArray()![i]}
								{@const gusts = daily.variables(5)!.valuesArray()![i]}
								{@const sunrise = toDate(daily.variables(6)!.valuesInt64(i)!)}
								{@const sunset = toDate(daily.variables(7)!.valuesInt64(i)!)}
								{@const uv = daily.variables(8)!.valuesArray()![i]}
								{@const precipSum = daily.variables(9)!.valuesArray()![i]}
								{@const condition = daily.variables(10)!.valuesArray()![i]}
								{@const date = toDate(Number(daily.time()) + i * daily.interval())}

								<article class="flex-1 basis-64 min-w-0 bg-term-light-bg dark:bg-term-dark-bg flex flex-col">
									<header class="flex justify-around gap-2 p-2">
										<p class="text-lg">
											{i === 0 ? "Today" : date.toLocaleDateString(undefined, { weekday: "short" })}
										</p>
										<p class="text-lg">
											{date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
										</p>
									</header>
									<div class="px-2 pb-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
										<span class="">High</span>
										<span class="text-right">{high.toFixed(0)}{tempUnit}</span>
										<span class="">Low:</span>
										<span class="text-right">{low.toFixed(0)}{tempUnit}</span>
										<span class="">Condition</span>
										<span class="text-right">{weather.getCondition(condition)}</span>
										<span class="">Rain</span>
										<span class="text-right">{rain.toFixed(0)}{rainUnit}</span>
										<span class="">Amount</span>
										<span class="text-right">{precipSum.toFixed(0)} {precipUnit}</span>
										<span class="">Wind / Gusts</span>
										<span class="text-right">{wind.toFixed(0)} {windUnit} / {gusts.toFixed()} {windUnit}</span>
										<span class="">UV</span>
										<span class="text-right">{uv.toFixed(0)}</span>
										<span class="">Visibility</span>
										<span class="text-right">{visibility.toFixed(0)} {visibilityUnit} / {(visibility / 5280).toFixed(1)} mi</span>
										<span class="">Sunrise</span>
										<span class="text-right">{sunrise.toLocaleTimeString()}</span>
										<span class="">Sunset</span>
										<span class="text-right">{sunset.toLocaleTimeString()}</span>
									</div>
								</article>
							{/each}
						</div>
					</section>
				</div>
			{/if}
		</div>
	</div>

	<InputDialog bind:this={weather.inputDialog} />
	<InfoDialog bind:this={weather.infoDialog} />
	<ErrorDialog bind:this={weather.errorDialog} />
	<ConfirmDialog bind:this={weather.confirmDialog} />
</div>