<script lang="ts">
    import { onMount } from "svelte";
	import { app } from "./BrowserApp.svelte.ts";

	onMount(() => {
		if (app.addressBar) {
			app.addressBar.addEventListener("keydown", (event) => {
				if (event.key === "Enter") {
					app.go();
				}
			})
		}
	});
</script>

<div class="h-full w-full overflow-y-auto flex flex-col">
	<!-- Top bar: refresh, back, forward, and address bar with search info or URL -->
	 <div class="bg-[#e0e0e0] dark:bg-[#101010] font-mono text-base flex flex-row">
		<input 
			bind:this={app.addressBar}
			type="text"
			placeholder="Go to a URL or search the web..."
			class="bg-term-light-bg dark:bg-term-dark-bg flex-1 border-none outline-none focus:outline-none focus:ring-0"
		/>
	 </div>
	<!-- iframe showing search engine or webpage and avoiding CORS issues with https://everyorigin.jwvbremen.nl/ -->
	{#if app.renderHTML}
		<iframe
			title="browser"
			class="flex-1"
			srcdoc={app.renderHTML}
		></iframe>
	{:else}
		<iframe
			title="browser"
			class="flex-1"
			src={app.src}
		></iframe>
	{/if}
</div>