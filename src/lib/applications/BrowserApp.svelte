<script lang="ts">
    import { onMount } from "svelte";
	import { app as browser } from "./BrowserApp.svelte.ts";

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
	});
</script>

<div class="h-full w-full overflow-y-auto flex flex-col">
	 <div class="bg-term-light-bg dark:bg-term-dark-bg font-mono text-base flex flex-row">
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