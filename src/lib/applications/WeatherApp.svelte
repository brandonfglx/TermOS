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
				<input
					type="text"
					placeholder="Enter zip code"
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
				{#each weather.info as item}
					<div class="flex flex-row gap-2 p-2 bg-term-light-bg dark:bg-term-dark-bg justify-center items-center min-w-0">
						<button class="flex-1 min-w-0 cursor-pointer bg-transparent border-none p-0 flex items-center text-left" aria-label={`${item[0].cityName}, ${item[0].regionCode}, ${item[0].countryCode}`} onclick={() => weather.goTo(item[0])}>
							<div class="title-clip w-full min-w-0 overflow-hidden">
								<h1 class="title-marquee w-max whitespace-nowrap" title={`${item[0].latitude}, ${item[0].longitude}`}>
									{`${item[0].cityName}, ${item[0].regionCode}, ${item[0].countryCode}`}
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
		<div class="h-full flex-3/4 flex flex-col">
			{#if !weather.loc || !weather.weather}
				<div class="flex-1 flex flex-col gap-4 justify-center items-center">
					<svg class="w-24" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
						<path d="M6,0C2.6862793,0,0,2.6862793,0,6s2.6862793,6,6,6s6-2.6862793,6-6S9.3137207,0,6,0z M6.5,9.5h-1v-1h1V9.5z   M7.2651367,6.1738281C6.7329102,6.5068359,6.5,6.6845703,6.5,7v0.5h-1V7c0-0.9023438,0.7138672-1.3486328,1.2348633-1.6738281  C7.2670898,4.9931641,7.5,4.8154297,7.5,4.5c0-0.5517578-0.4487305-1-1-1h-1c-0.5512695,0-1,0.4482422-1,1V5h-1V4.5  c0-1.1025391,0.8969727-2,2-2h1c1.1030273,0,2,0.8974609,2,2C8.5,5.4023438,7.7861328,5.8486328,7.2651367,6.1738281z" fill="currentColor"/>
					</svg>
					<h1 class="text-2xl text-center">Location Not Found</h1>
				</div>
			{:else}
				<div class="w-full p-8 flex flex-col justify-center items-center">
					<p class="">{`${weather.loc.cityName}, ${weather.loc.regionCode}, ${weather.loc.countryCode}`}</p>
					<p class="text-6xl">{`${weather.getWeatherVar(0)!.value().toFixed(0)}${weather.UNIT_TO_STRING[weather.getWeatherVar(0)!.unit()]}`}</p>
					<p class="">{`Feels Like: ${weather.getWeatherVar(1)!.value().toFixed(0)}${weather.UNIT_TO_STRING[weather.getWeatherVar(1)!.unit()]}`}</p>
				</div>
				<div class="w-full p-2 flex flex-row items-center">
					
				</div>
				<div class="w-full p-2 flex flex-row items-center">
					<div class="">

					</div>
					<div class="">

					</div>
				</div>
			{/if}
		</div>
	</div>

	<InputDialog bind:this={weather.inputDialog} />
	<InfoDialog bind:this={weather.infoDialog} />
	<ErrorDialog bind:this={weather.errorDialog} />
	<ConfirmDialog bind:this={weather.confirmDialog} />
</div>