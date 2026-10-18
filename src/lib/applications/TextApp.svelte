<script lang="ts">
	import { app } from "./TextApp.svelte.ts";

	let textArea: HTMLDivElement;

	$effect(() => {
		app.content;

		textArea.scrollTo({
			top: textArea.scrollHeight,
			behavior: "auto"
		});
	});
</script>

<div class="h-full w-full overflow-y-auto flex flex-row">
	<div class="">
		<p>line no.</p>
	</div>
	<div class="flex-1 bg-[#101010]" bind:this={textArea}>
		<p>text area</p>
	</div>
</div>