<script lang="ts">
    import { terminal } from "$lib/components/listeners/Terminal.svelte";
	import { onMount } from "svelte";

	let termApp: HTMLDivElement;

	onMount(() => {
		terminal.loadCommands();
		terminal.onLoad();
	});

	$effect(() => {
		terminal.history.length;

		termApp.scrollTo({
			top: termApp.scrollHeight,
			behavior: "auto"
		});
	});
</script>

<!-- Strictly bind the desktop to its current state, don't allow applications to change desktop boundaries -->
<div class="h-full w-full overflow-y-auto font-mono text-base" bind:this={termApp}>
	{#each terminal.history as line}
		{#each line as content}
			<p class="break-all whitespace-pre-wrap {content[0]}">
				{content[1]}
			</p>
		{/each}
	{/each}
</div>