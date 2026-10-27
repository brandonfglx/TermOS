<script lang="ts">
	import { app as music } from "./MusicApp.svelte.ts";
</script>

<div class="h-full w-full flex flex-row font-mono text-base">
	<!-- Similar to browser, but uses YouTube's iframe embed feature to autoplay radio and randomize when complete; use https://developers.google.com/youtube/iframe_api_reference and add ?autoplay=1 into url -->
	<!-- Sidebar for upcoming music + controls -->
	<div class="bg-[#f0f0f0] dark:bg-[#101010] h-full min-h-0 p-2 flex flex-col gap-2">
		<!-- Control to shuffle and add music -->
		<div class="flex shrink-0 flex-row gap-2 p-2 bg-[#d8d8d8] dark:bg-[#222222]">
			{#if music.playing}
				<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Pause" onclick={() => {music.togglePlaying()}}>
					<svg viewBox="-1 0 8 8" xmlns="http://www.w3.org/2000/svg">
						<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
							<g transform="translate(-227.000000, -3765.000000)" fill="currentColor">
								<g transform="translate(56.000000, 160.000000)">
									<path d="M172,3605 C171.448,3605 171,3605.448 171,3606 L171,3612 C171,3612.552 171.448,3613 172,3613 C172.552,3613 173,3612.552 173,3612 L173,3606 C173,3605.448 172.552,3605 172,3605 M177,3606 L177,3612 C177,3612.552 176.552,3613 176,3613 C175.448,3613 175,3612.552 175,3612 L175,3606 C175,3605.448 175.448,3605 176,3605 C176.552,3605 177,3605.448 177,3606"></path>
								</g>
							</g>
						</g>
					</svg>
				</button>
			{:else}
				<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Play" onclick={() => {music.togglePlaying()}}>
					<svg viewBox="-0.5 0 7 7" xmlns="http://www.w3.org/2000/svg">
						<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
							<g transform="translate(-347.000000, -3766.000000)" fill="currentColor">
								<g transform="translate(56.000000, 160.000000)">
									<path d="M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322"></path>
								</g>
							</g>
						</g>
					</svg>
				</button>
			{/if}
			<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Shuffle" onclick={() => {music.shuffle()}}>
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M18 20L21 17M21 17L18 14M21 17H17C14.2386 17 12 14.7614 12 12C12 9.23858 9.76142 7 7 7H3M18 4L21 7M21 7L18 10M21 7L17 7C15.8744 7 14.8357 7.37194 14 7.99963M3 17H7C8.12561 17 9.16434 16.6277 10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			<input
				type="text"
				placeholder="YouTube ID or URL..."
				class="bg-term-light-bg dark:bg-term-dark-bg border-none outline-none focus:outline-none focus:ring-0"
				bind:value={music.input}
				onkeydown={(event) => {
					if (event.key === "Enter") {
						music.add();
					}
				}}
			/>
			<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Add" onclick={() => {music.add()}}>
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<rect data-name="--Rectangle" fill="none" height="20" id="_--Rectangle" rx="2" ry="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="20" x="2" y="2"/>
					<line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="15.5" x2="8.5" y1="12" y2="12"/>
					<line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="15.5" y2="8.5"/>
				</svg>
			</button>
		</div>
		<div class="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto">
			{#each music.playlist as item, index}
				<div class="flex flex-row gap-2 p-2 bg-term-light-bg dark:bg-term-dark-bg justify-center items-center">
					<h1 class="flex-1">{item}</h1>
					<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Remove" onclick={() => {music.remove(index)}}>
						<svg fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
							<path d="M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048zM9.76 20.256q0 0.832 0.576 1.408t1.44 0.608 1.408-0.608l2.816-2.816 2.816 2.816q0.576 0.608 1.408 0.608t1.44-0.608 0.576-1.408-0.576-1.408l-2.848-2.848 2.848-2.816q0.576-0.576 0.576-1.408t-0.576-1.408-1.44-0.608-1.408 0.608l-2.816 2.816-2.816-2.816q-0.576-0.608-1.408-0.608t-1.44 0.608-0.576 1.408 0.576 1.408l2.848 2.816-2.848 2.848q-0.576 0.576-0.576 1.408z"></path>
						</svg>
					</button>
				</div>
			{/each}
		</div>
	</div>
	<!-- Container for YT video iframe -->
	{#if music.src}
		<iframe
			id="player"
			title="Music Player"
			class="flex-1"
			allow="autoplay"
			allowfullscreen
			src={music.src}
			bind:this={music.frame}
		>
		</iframe>
	{:else}
		<div class="flex-1 flex flex-col gap-4 justify-center items-center">
			<svg class="w-24" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
				<path d="M6,0C2.6862793,0,0,2.6862793,0,6s2.6862793,6,6,6s6-2.6862793,6-6S9.3137207,0,6,0z M6.5,9.5h-1v-1h1V9.5z   M7.2651367,6.1738281C6.7329102,6.5068359,6.5,6.6845703,6.5,7v0.5h-1V7c0-0.9023438,0.7138672-1.3486328,1.2348633-1.6738281  C7.2670898,4.9931641,7.5,4.8154297,7.5,4.5c0-0.5517578-0.4487305-1-1-1h-1c-0.5512695,0-1,0.4482422-1,1V5h-1V4.5  c0-1.1025391,0.8969727-2,2-2h1c1.1030273,0,2,0.8974609,2,2C8.5,5.4023438,7.7861328,5.8486328,7.2651367,6.1738281z" fill="currentColor"/>
			</svg>
			<h1 class="text-2xl text-center">Video Not Found</h1>
		</div>
	{/if}
</div>