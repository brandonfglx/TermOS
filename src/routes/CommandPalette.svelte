<script lang="ts">
	import { palette } from "$lib/components/CommandPalette.svelte";
	import { tick } from "svelte";

	let input: HTMLInputElement | undefined = $state();
	let previousFocus: HTMLElement | null = null;

	$effect(() => {
		if (palette.open) {
			previousFocus = document.activeElement as HTMLElement | null;

			tick().then(() => {
				if (palette.open) {
					input?.focus();
				}
			});
		} else {
			previousFocus?.focus();
			previousFocus = null;
		}
	});

	function handleInput(event: Event): void {
		palette.setQuery((event.target as HTMLInputElement).value);
	}
</script>

{#if palette.open}
	<div class="fixed inset-0 z-1001 flex items-start justify-center px-4 pt-[10dvh]">
		<button
			type="button"
			class="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
			aria-label="Close Command Palette"
			onclick={() => palette.close()}
		></button>

		<div class="relative w-full max-w-2xl overflow-hidden border border-separator-light/20 bg-header-light-bg font-mono shadow-2xl dark:border-separator-dark/70 dark:bg-header-dark-bg" role="dialog" aria-modal="true" aria-label="Command Palette">
			<div class="flex items-center gap-2 border-b border-separator-light/20 px-4 dark:border-separator-dark/70">
				<input
					class="min-w-0 flex-1 bg-transparent py-3 text-base border-none outline-none focus:outline-none focus:ring-0 placeholder:text-black/50 dark:placeholder:text-white/50"
					type="text"
					value={palette.query}
					oninput={handleInput}
					placeholder="Search apps, commands, files..."
					aria-label="Search apps, commands, files..."
					autocomplete="off"
					spellcheck="false"
					bind:this={input}
				/>

				<kbd class="border border-separator-light/20 px-1.5 py-0.5 text-base dark:border-separator-dark/70">Esc</kbd>
			</div>

			<div class="max-h-[60dvh] overflow-y-auto p-2 text-base" role="listbox" aria-label="Results">
				{#if palette.results.length === 0}
					<p class="px-3 py-8 text-center text-lg">No Results</p>
				{:else}
					{#each palette.results as item, index}
						<button
							type="button"
							role="option"
							aria-selected={index === palette.selectedIndex}
							class="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors {index === palette.selectedIndex ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"}"
							onclick={() => palette.run(index)}
							onmouseenter={() => palette.setSelectedIndex(index)}
						>
							<span class="w-24 shrink-0 truncate">{item.category}</span>
							<span class="min-w-0 flex-1">
								<span class="block truncate">{item.label}</span>
								<span class="block truncate">{item.desc}</span>
							</span>
							{#if index === palette.selectedIndex}
								<kbd class="shrink-0 border border-separator-light/20 px-1.5 py-0.5 text-base dark:border-separator-dark/70">Go</kbd>
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			<div class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-separator-light/20 px-4 py-2 text-base dark:border-separator-dark/70">
				<span>Use arrow keys to navigate | Enter to run | Esc to close</span>
			</div>
		</div>
	</div>
{/if}