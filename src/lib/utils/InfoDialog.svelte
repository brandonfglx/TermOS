<script lang="ts">
	interface InfoDialogOptions {
		title?: string,
		content?: string,
	}

	let dialog: HTMLDialogElement | null = $state(null);
	let title: string = $state("");
	let content: string = $state("");
	
	let resolve: ((value: void) => void) | null = null;

	export async function log(options: InfoDialogOptions = {}): Promise<void> {
		title = options.title ?? "Info";
		content = options.content ?? "Content Missing";

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

		resolve();
		resolve = null;
	}
</script>

<dialog class="w-full h-full flex justify-center items-center bg-transparent backdrop-blur-[2px]" bind:this={dialog} onclose={handleClose}>
	<form class="bg-desktop-light-bg text-light-fg dark:bg-desktop-dark-bg dark:text-dark-fg p-6 rounded-lg font-mono text-base flex flex-col gap-4 justify-center" method="dialog">
		<h1 class="text-xl">{title}</h1>
		<p class="">{content}</p>
	</form>
</dialog>