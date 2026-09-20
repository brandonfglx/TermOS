<script lang="ts">
    import { desktop } from "$lib/components/listeners/Desktop.svelte";
    import { onMount } from "svelte";

	// When loaded, dynamically fetch all applications
	onMount(() => {
		desktop.loadApplications();
	});
</script>

<!-- The main interface for apps and terminal; each app has its own window and can be switch via keybinds (ctrl + `) -->

<div class="flex-1 min-h-0 overflow-hidden w-full relative">
	{#each desktop.apps as App}
		<App />
	{/each}
</div>

