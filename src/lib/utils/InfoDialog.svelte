<script lang="ts">
	import { tick } from "svelte";

	interface InfoDialogOptions {
		title?: string,
		content?: string,
	}

	let dialog: HTMLDialogElement | null = $state(null);
	let title: string = $state("");
	let content: string = $state("");
	
	let resolve: ((value: void) => void) | null = null;

	export async function log(options: InfoDialogOptions = {}): Promise<void> {
		if (resolve !== null) {
			return Promise.reject(new Error("InfoDialog: another request is already active"));
		}

		title = options.title ?? "Info";
		content = options.content ?? "Content Missing";
		
		// Wait until DOM finishes loading
		await tick();

		if (!dialog) {
			return Promise.reject(new Error("InfoDialog: dialog not mounted after tick"));
		}

		return new Promise((res) => {
			resolve = res;

			dialog?.show();
			dialog?.focus();
		});
	}

	function handleClose(): void {
		if (!resolve || !dialog) {
			return;
		}

		resolve();
		resolve = null;
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			event.preventDefault();
			dialog?.close("close");
		}
	}
</script>

<dialog class="absolute inset-0 z-100 m-0 w-full h-full max-w-none max-h-none border-0 bg-transparent p-0 outline-none" bind:this={dialog} onclose={handleClose} onkeydown={handleKeydown}>
	<div class="h-full w-full flex justify-center items-center backdrop-blur-[2px]">
		<form class="text-light-fg dark:text-dark-fg bg-term-light-bg dark:bg-term-dark-bg min-w-1/4 p-6 rounded-lg font-mono text-base flex flex-col gap-2 justify-center" method="dialog">
			<div class="w-full flex flex-row items-center">
				<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" type="button" value="close" formnovalidate aria-label="Close" onclick={() => dialog?.close("close")}>
					<svg fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
						<path d="M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048zM9.76 20.256q0 0.832 0.576 1.408t1.44 0.608 1.408-0.608l2.816-2.816 2.816 2.816q0.576 0.608 1.408 0.608t1.44-0.608 0.576-1.408-0.576-1.408l-2.848-2.848 2.848-2.816q0.576-0.576 0.576-1.408t-0.576-1.408-1.44-0.608-1.408 0.608l-2.816 2.816-2.816-2.816q-0.576-0.608-1.408-0.608t-1.44 0.608-0.576 1.408 0.576 1.408l2.848 2.816-2.848 2.848q-0.576 0.576-0.576 1.408z"></path>
					</svg>
				</button>
			</div>
			<div class="flex flex-col items-center gap-2 text-left">
				<h1 class="w-full text-2xl">{title}</h1>
				<pre class="w-full">{content}</pre>
			</div>
		</form>
	</div>
</dialog>