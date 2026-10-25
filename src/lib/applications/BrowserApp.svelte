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
	 <div class="bg-term-light-bg dark:bg-term-dark-bg font-mono text-base flex flex-row">
		<input 
			bind:this={app.addressBar}
			type="text"
			placeholder="Go to a URL or search the web..."
			class="bg-term-light-bg dark:bg-term-dark-bg flex-1 border-none outline-none focus:outline-none focus:ring-0"
		/>
	 </div>
	{#if app.renderHTML}
		<iframe
			title="browser"
			class="flex-1"
			allow="autoplay"
			srcdoc={app.renderHTML}
			allowfullscreen
		></iframe>
	{:else}
		<iframe
			title="browser"
			class="flex-1"
			allow="autoplay"
			src={app.src}
			allowfullscreen
		></iframe>
	{/if}
</div>