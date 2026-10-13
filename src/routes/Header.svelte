<script lang="ts">
	import { header } from "$lib/components/Header.svelte";
	import { onMount } from "svelte";
    import HeaderMenu from "./HeaderMenu.svelte";

	let date = $state("");

	onMount(() => {
		date = header.getFormattedDateTime();
	});

	$effect(() => {
		let id = setInterval(() => {
			date = header.getFormattedDateTime();
		}, 1000);

		return () => clearInterval(id);
	});
</script>

<!-- Left: TermOS / system menu items | Middle: Date and time | Right: default/terminal: shortcuts to application (ie weather, search, etc) otherwise apps define menu items -->

<div class="bg-header-light-bg dark:bg-header-dark-bg flex p-1 align-center">
	<div class="font-mono flex-2 p-0.5 flex flex-row align-center">
		{#each header.sysCtrls as sysCtrl}
			<HeaderMenu menu={sysCtrl} />
		{/each}
	</div>
	<div class="font-mono text-xl">
		{date}
	</div>
	<div class="flex-mono flex-2 p-0.5 flex flex-row-reverse align-center">
		{#each header.controls as control}
			<HeaderMenu menu={control} />
		{/each}
	</div>
</div>