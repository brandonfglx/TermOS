<script lang="ts">
	import { header } from "$lib/components/Header.svelte";
	import { desktop } from "$lib/components/listeners/Desktop.svelte";
    import HeaderMenu from "./HeaderMenu.svelte";

	let date = $state(new Date().toLocaleString());

	$effect(() => {
		let id = setInterval(() => {
			date = new Date().toLocaleString()
		}, 1000);

		return () => clearInterval(id);
	});

	let appHeader = $derived(desktop.active?.[1].header ?? header);
	let leftMenus = $derived(appHeader.left ?? []);
	let rightMenus = $derived(appHeader.right ?? []);
</script>

<div class="relative z-99 flex items-center gap-1 bg-header-light-bg dark:bg-header-dark-bg p-1 font-mono text-base">
	<div class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
		{#each leftMenus as menu}
			<HeaderMenu {menu} align="start" />
		{/each}
	</div>
	<div class="shrink-0 whitespace-nowrap text-xl">
		{date}
	</div>
	<div class="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1">
		{#each rightMenus as menu}
			<HeaderMenu {menu} align="end" />
		{/each}
	</div>
</div>