<script lang="ts">
    import { terminal } from "$lib/components/listeners/Terminal.svelte";

	// Keyboard input is managed by +page.svelte & KeyboardManager.ts
</script>

<style>
	#cursor {
		display: inline-flex;
		width: 10px;
		height: 20px;
		animation: blink 1s infinite steps(1);
	}

	@keyframes blink {
		0%, 49% {
			background-color: var(--color-white);
			color: var(--color-black);
		}
		50%, 100% {
			background-color: var(--color-term-cursor);
			color: transparent;
		}
	}

	@media (prefers-color-scheme: dark) {
		@keyframes blink {
			0%, 49% {
				background-color: var(--color-term-bg);
				color: var(--color-term-fg);
			}
			50%, 100% {
				background-color: var(--color-term-cursor);
				color: transparent;
			}
		}
	}
</style>

<!-- Bottom bar is a terminal input (always present) commands are called and debug/info is printed to terminal "app" on desktop (unless launched using -cli) -->

<div class="bg-term-light-bg dark:bg-term-dark-bg p-2 font-mono text-base">
	<span class="break-all whitespace-pre-wrap">{terminal.prefix}{terminal.input.substring(0, terminal.inputIndex)}</span>{#if terminal.input.charAt(terminal.inputIndex).trim().length === 0}<span id="cursor" class="break-all whitespace-pre-wrap align-text-bottom">{terminal.input.charAt(terminal.inputIndex)}</span>{:else}<span id="cursor" class="break-all whitespace-pre-wrap">{terminal.input.charAt(terminal.inputIndex)}</span>{/if}<span class="break-all whitespace-pre-wrap">{terminal.input.substring(terminal.inputIndex + 1)}</span>
</div>