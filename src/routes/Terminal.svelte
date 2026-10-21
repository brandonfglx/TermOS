<script lang="ts">
    import { kbManager } from "$lib/components/KeyboardManager.svelte";
    import { terminal } from "$lib/components/listeners/Terminal.svelte";
    import { onMount } from "svelte";

	let input: HTMLDivElement;

	// Keyboard input is managed by +page.svelte & KeyboardManager.ts
	onMount(() => {
		input.addEventListener("click", () => {
			kbManager.makeActive(terminal);
		});
	});
</script>

<style>
	#cursor {
		display: inline-flex;
		width: 10px;
		height: 20px;
	}

	.cursor-enabled {
		animation: blink 1s infinite steps(1);
	}

	.cursor-disabled {
		background-color: var(--color-white);
		color: transparent;
		border-width: 1px;
		border-color: var(--color-term-cursor);
	}

	@keyframes blink {
		0%, 50% {
			background-color: var(--color-term-cursor);
			color: transparent;
		}
		50%, 100% {
			background-color: var(--color-white);
			color: var(--color-black);
		}
	}

	@media (prefers-color-scheme: dark) {
		.cursor-disabled {
			background-color: var(--color-term-bg);
			color: transparent;
			border-width: 1px;
			border-color: var(--color-term-cursor);
		}

		@keyframes blink {
			0%, 50% {
				background-color: var(--color-term-cursor);
				color: transparent;
			}
			50%, 100% {
				background-color: var(--color-term-bg);
				color: var(--color-term-fg);
			}
		}
	}
</style>

<!-- Bottom bar is a terminal input (always present) commands are called and debug/info is printed to terminal "app" on desktop (unless launched using -cli) -->
<div class="bg-term-light-bg dark:bg-term-dark-bg p-2 font-mono text-base" bind:this={input}>
	<span class="break-all whitespace-pre-wrap">{terminal.prefix}{terminal.input.substring(0, terminal.inputIndex)}</span>{#if terminal.input.charAt(terminal.inputIndex).trim().length === 0}<span id="cursor" class="break-all whitespace-pre-wrap align-text-bottom" class:cursor-enabled={kbManager.getActive() === terminal} class:cursor-disabled={kbManager.getActive() !== terminal}>{terminal.input.charAt(terminal.inputIndex)}</span>{:else}<span id="cursor" class="break-all whitespace-pre-wrap" class:cursor-enabled={kbManager.getActive() === terminal} class:cursor-disabled={kbManager.getActive() !== terminal}>{terminal.input.charAt(terminal.inputIndex)}</span>{/if}<span class="break-all whitespace-pre-wrap">{terminal.input.substring(terminal.inputIndex + 1)}</span>
</div>