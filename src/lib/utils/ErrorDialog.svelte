<script lang="ts">
	interface ErrorDialogOptions {
		title?: string,
		content?: string,
	}

	let dialog: HTMLDialogElement | null = $state(null);
	let title: string = $state("");
	let content: string = $state("");

	let resolve: ((value: void) => void) | null = null;

	export async function error(options: ErrorDialogOptions = {}): Promise<void> {
		title = options.title ?? "An Error Occurred";
		content = options.content ?? "No Description";

		if (dialog) {
			dialog.showModal();
		}

		return new Promise((res) => {
			resolve = res;
		});
	}

	function handleClose(): void {
		if (!resolve || !dialog) {
			return;
		}

		// Signal return and reset resolve
		resolve();
		resolve = null;
	}
</script>

<!-- Dialoge that appears when an application (not Terminal or Terminal comamnds) experiences an error -->
<dialog class="w-full h-full flex justify-center items-center bg-transparent backdrop-blur-[2px]" bind:this={dialog} onclose={handleClose}>
	<form class="text-white bg-red-500 p-6 rounded-lg font-mono text-base flex flex-col gap-4 justify-center" method="dialog">
		<h1 class="text-xl">{title}</h1>
		<p class="">{content}</p>
	</form>
</dialog>