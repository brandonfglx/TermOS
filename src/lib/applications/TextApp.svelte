<script lang="ts">
	import { app as text } from "./TextApp.svelte.ts";
</script>

<div class="h-full w-full overflow-y-auto flex flex-row font-mono text-base">
	<div class="flex flex-col h-full overflow-y-hidden select-none text-right p-2" bind:this={text.lineNumArea}>
		{#each Array(text.numLines) as _, i}
			<div class="whitespace-pre">{String(i + 1).padStart(2, " ")}</div>
		{/each}
	</div>
	<textarea
		bind:this={text.textArea}
		bind:value={text.content}
		onscroll={() => text.handleScroll()}
		spellcheck="false"
		class="flex-1 bg-[#101010] p-2 m-0 border-none resize-none outline-none focus:outline-none focus:ring-0 whitespace-pre overflow-auto overscroll-contain"
	></textarea>
</div>