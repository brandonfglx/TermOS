<script lang="ts">
    import { terminal } from "$lib/components/listeners/Terminal.svelte";
</script>

<div class="font-mono text-base">
	{#each terminal.history as comp}
		<p class="break-all whitespace-pre-wrap {comp[0]}">
			{comp[1]}
		</p>
	{/each}
</div>