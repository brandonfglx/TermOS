<script lang="ts">
    import Desktop from "./Desktop.svelte";
    import Header from "./Header.svelte";
    import Terminal from "./Terminal.svelte";
    import AppSwitcher from "./AppSwitcher.svelte";
    import CommandPalette from "./CommandPalette.svelte";
    import { kbManager } from "$lib/components/KeyboardManager.svelte";
	import { onMount } from "svelte";
    import { desktop } from "$lib/components/listeners/Desktop.svelte";
    import { palette } from "$lib/components/CommandPalette.svelte";

    // All input handling should be managed by +page.svelte
	onMount(() => {
        function handleKeydown(event: KeyboardEvent): void {
            if (desktop.handleGlobalKeydown(event)) {
                palette.close();
                return;
            }

            if (palette.handleGlobalKeydown(event)) {
                desktop.cancelSwitch();
                return;
            }

            if (palette.handleKeydown(event)) {
                return;
            }

            if (palette.open || desktop.switching) {
                return;
            }

            kbManager.keydown(event);
        }

        function handleKeyup(event: KeyboardEvent): void {
            if (desktop.handleGlobalKeyup(event) || palette.open || desktop.switching) {
                return;
            }

            kbManager.keyup(event);
        }

        function handlePaste(event: ClipboardEvent): void {
            if (palette.open) {
                return;
            }

            kbManager.paste(event);
        }

        function handleBlur(): void {
            desktop.cancelSwitch();
        }

		document.addEventListener("keydown", handleKeydown);
		document.addEventListener("keyup", handleKeyup);
        document.addEventListener("paste", handlePaste);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("keydown", handleKeydown);
            document.removeEventListener("keyup", handleKeyup);
            document.removeEventListener("paste", handlePaste);
            window.removeEventListener("blur", handleBlur);
        }
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

<AppSwitcher />
<CommandPalette />