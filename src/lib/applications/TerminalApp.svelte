<script lang="ts">
    import { terminal } from "$lib/components/listeners/Terminal.svelte";
	import { app } from "./TerminalApp.svelte.ts";
    import ErrorDialog from "$lib/utils/ErrorDialog.svelte";
    import InfoDialog from "$lib/utils/InfoDialog.svelte";
    import InputDialog from "$lib/utils/InputDialog.svelte";
	import { onMount } from "svelte";
    import ConfirmDialog from "$lib/utils/ConfirmDialog.svelte";

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
<div class="relative h-full w-full">
	<div class="h-full w-full overflow-y-auto font-mono text-base" bind:this={termApp}>
		{#each terminal.history as line}
			{#each line as content}
				<p class="break-all whitespace-pre-wrap {content[0]}">
					{content[1]}
				</p>
			{/each}
		{/each}
	</div>

	<InputDialog bind:this={app.inputDialog} />
	<InfoDialog bind:this={app.infoDialog} />
	<ErrorDialog bind:this={app.errorDialog} />
	<ConfirmDialog bind:this={app.confirmDialog} />
</div>