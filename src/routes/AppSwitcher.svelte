<script lang="ts">
	import { desktop } from "$lib/components/listeners/Desktop.svelte";

	let apps = $derived(desktop.getSwitchApps());
	let switchIndex = $derived(desktop.switchIndex);
	let switching = $derived(desktop.switching);
</script>

{#if switching && apps.length > 0}
	<div class="fixed inset-0 z-1000 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
			aria-label="Cancel App Switcher"
			onclick={() => desktop.cancelSwitch()}
		></button>
		<div class="relative w-full max-w-3xl border border-separator-light/20 bg-header-light-bg p-4 font-mono text-base shadow-2xl dark:border-separator-dark/70 dark:bg-header-dark-bg" role="dialog" aria-modal="true" aria-label="App Switcher">
			<div class="mb-3 flex items-center justify-between gap-4">
				<p class="text-lg">Switch App</p>
				<span class="">Ctrl + Tab</span>
			</div>
			<div class="grid max-h-11/12 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4 p-1">
				{#each apps as app, index}
					<button
						type="button"
						class="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 border border-separator-light/20 p-3 text-center transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:border-separator-dark/70 dark:hover:bg-white/10 {index === switchIndex ? "bg-black/10 ring-2 ring-current dark:bg-white/10" : ""}"
						aria-current={index === switchIndex}
						onclick={() => desktop.switchToIndex(index)}
					>
						<span class="flex size-10 items-center justify-center bg-black/10 dark:bg-white/10 text-lg">
							{app.name.slice(0, 1)}
						</span>
						<span class="max-w-full truncate">{app.name}</span>
					</button>
				{/each}
			</div>

			<p class="mt-3 text-center">
				Release modifier to switch | Esc to cancel
			</p>
		</div>
	</div>
{/if}