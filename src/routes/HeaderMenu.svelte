<script lang="ts">
    import { HeaderMenu } from "$lib/components/Header.svelte";
    import { onMount } from "svelte";

	let { menu, align }: { menu: HeaderMenu, align?: "start" | "end" } = $props();

	let open = $state(false);
	let root: HTMLDivElement | undefined = $state();

	function close(): void {
		open = false;
	}

	function handlePointerDown(event: PointerEvent): void {
		if (open && root && !root.contains(event.target as Node)) {
			close();
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape" && open) {
			close();
		}
	}
</script>

<svelte:window onpointerdown={handlePointerDown} onkeydown={handleKeydown} />

<div class="relative inline-flex shrink-0 font-mono text-base" bind:this={root}>
	<button
		type="button"
		class="flex min-h-8 max-w-48 min-w-0 cursor-pointer items-center gap-1 px-2 py-1 whitespace-nowrap transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:cursor-default disabled:opacity-50 dark:hover:bg-white/10 {open ? "bg-black/10 dark:bg-white/10" : ""}"
		aria-haspopup="menu"
		aria-expanded={open}
		disabled={menu.items.length === 0}
		title={menu.name}
		onclick={() => open = !open}
	>
		<span class="truncate">{menu.name}</span>
	</button>

	{#if open && menu.items.length > 0}
		<div class="absolute top-full z-100 mt-1 max-h-[min(24rem, 70dvh)] w-max min-w-full max-w-[min(24rem, calc(100vw_-_1rem))] overflow-y-auto overscroll-contain border border-separator-light/20 bg-header-light-bg py-1 shadow-lg dark:border-separator-dark/70 dark:bg-header-dark-bg {align === "end" ? "right-0" : "left-0"}" role="menu" aria-label={menu.name}>
			{#each menu.items as item}
				<button
					type="button"
					role="menuitem"
					class="block w-full cursor-pointer truncate px-3 py-1.5 text-left transition-colors hover:bg-black/10 focus-visible:bg-black/10 focus-visible:outline-none dark:hover:bg-white/10 dark:focus-visible:bg-white/10"
					title={item.name}
					onclick={() => {
						close();
						item.onclick();
					}}
				>
					{item.name}
				</button>
			{/each}
		</div>
	{/if}
</div>