<script lang="ts">
	import { onMount } from "svelte";
	import { app as browser } from "./BrowserApp.svelte.ts";
	import InputDialog from "$lib/utils/InputDialog.svelte";
	import InfoDialog from "$lib/utils/InfoDialog.svelte";
	import ErrorDialog from "$lib/utils/ErrorDialog.svelte";

	onMount(() => {
		// Force HTML elements to respect application keydown handling
		if (browser.addressBar) {
			browser.addressBar.addEventListener("keydown", (event) => {
				if (event.key === "Enter") {
					browser.go();
				}

				browser.keydown(event);
			})
		}

		browser.goTo(browser.defaultWebsite);
	});
</script>

<div class="relative h-full w-full">
	<div class="h-full w-full overflow-y-auto flex flex-col font-mono text-base">
		<div class="bg-[#f0f0f0] dark:bg-[#101010] w-full p-2 flex flex-row gap-2">
			<button class="w-8 shrink-0 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Home" onclick={() => browser.goTo(browser.defaultWebsite)}>
				<svg fill="currentColor" viewBox="0 0 495.398 495.398" xmlns="http://www.w3.org/2000/svg">
						<path d="M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.514z"/>
						<path d="M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z"/>
				</svg>
			</button>
			<input 
				type="text"
				placeholder="Go to a URL or search the web..."
				class="bg-term-light-bg dark:bg-term-dark-bg flex-1 border-none outline-none focus:outline-none focus:ring-0"
				bind:this={browser.addressBar}
			/>
		</div>
		{#if browser.renderHTML}
			<iframe
				title="Browser"
				class="flex-1"
				allow="autoplay"
				srcdoc={browser.renderHTML}
				allowfullscreen
				bind:this={browser.frame}
			></iframe>
		{:else}
			<iframe
				title="Browser"
				class="flex-1"
				allow="autoplay"
				src={browser.src}
				allowfullscreen
				bind:this={browser.frame}
			></iframe>
		{/if}
	</div>

	<InputDialog bind:this={browser.inputDialog} />
	<InfoDialog bind:this={browser.infoDialog} />
	<ErrorDialog bind:this={browser.errorDialog} />
</div>