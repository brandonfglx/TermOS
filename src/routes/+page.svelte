<script lang="ts">
    import Desktop from "./Desktop.svelte";
    import Header from "./Header.svelte";
    import Terminal from "./Terminal.svelte";
    import { kbManager } from "$lib/components/KeyboardManager.svelte";
	import { onMount } from "svelte";

	onMount(() => {
		document.addEventListener("keydown", (event: KeyboardEvent) => {
            kbManager.keydown(event);
		});

		document.addEventListener("keyup", (event: KeyboardEvent) => {
            kbManager.keyup(event);
		});
	});
</script>

<svelte:head>
	<title>TermOS</title>
</svelte:head>

<div class="flex flex-col h-lvh">
    <Header />
    <div class="w-full h-px bg-separator-light dark:bg-separator-dark"></div>
    <Desktop />
    <div class="w-full h-px bg-separator-light dark:bg-separator-dark"></div>
    <Terminal />
</div>