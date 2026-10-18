<script lang="ts">
    import { kbManager } from "$lib/components/KeyboardManager.svelte";
    import { desktop } from "$lib/components/listeners/Desktop.svelte";
    import { onMount } from "svelte";

	let viewport: HTMLDivElement;

	// When loaded, dynamically fetch all applications
	onMount(() => {
		desktop.loadApplications();

		viewport.addEventListener("click", () => {
			// Capture keyboard manager attention
			let app = desktop.active?.[1];
			if (app) {
				kbManager.makeActive(app);
			}
		});
	});
</script>

<!-- The main interface for apps and terminal; each app has its own window and can be switch via keybinds (ctrl + `) -->

<div class="flex-1 min-h-0 overflow-hidden w-full relative" bind:this={viewport}>
	{#if desktop.active}
		{@const App = desktop.active[2]}
		<App />
	{/if}
</div>

