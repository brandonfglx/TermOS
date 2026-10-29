<script lang="ts">
	interface InputDialogOptions {
		prompt?: string,
		placeholder?: string,
	}

	let dialog: HTMLDialogElement | undefined = $state();
	let input: string = $state("");
	let prompt: string = $state("");
	let placeholder: string = $state("");

	// Tracks whether the promise is currently active using callback
	let resolve: ((value: string | null) => void) | null = null;

	export function ask(options: InputDialogOptions = {}): Promise<string | null> {
		prompt = options.prompt ?? "Enter value:";
		placeholder = options.placeholder ?? "";
		input = "";

		if (dialog) {
			dialog.showModal();
		}

		return new Promise<string | null>((res) => {
			resolve = res;
		});
	}

	function handleClose(): void {
		if (!resolve || !dialog) {
			return;
		}

		if (dialog.returnValue === "submit") {
			resolve(input);
		} else {
			resolve(null); // Closed with cancel or esc key
		}

		resolve = null;
	}
</script>

<!-- InputDialouge represents a "hidden" basic popup dialouge that asks any generic input and automatically handles formatting -->
<dialog class="w-full h-full flex justify-center items-center bg-transparent backdrop-blur-[2px]" bind:this={dialog} onclose={handleClose}>
	<form class="text-light-fg dark:text-dark-fg bg-[#f0f0f0] dark:bg-[#101010] p-6 rounded-lg font-mono text-base flex flex-col gap-4 justify-center" method="dialog">
		<div class="flex flex-row items-center gap-2">
			<label for="input">{prompt}</label>
			<input id="input" class="bg-term-light-bg dark:bg-term-dark-bg border-none outline-none focus:outline-none focus:ring-0" type="text" bind:value={input} placeholder={placeholder} required/>
		</div>
		<div class="flex flex-row justify-between">
			<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" type="button" value="cancel" formnovalidate aria-label="Cancel">
				<svg fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048zM9.76 20.256q0 0.832 0.576 1.408t1.44 0.608 1.408-0.608l2.816-2.816 2.816 2.816q0.576 0.608 1.408 0.608t1.44-0.608 0.576-1.408-0.576-1.408l-2.848-2.848 2.848-2.816q0.576-0.576 0.576-1.408t-0.576-1.408-1.44-0.608-1.408 0.608l-2.816 2.816-2.816-2.816q-0.576-0.608-1.408-0.608t-1.44 0.608-0.576 1.408 0.576 1.408l2.848 2.816-2.848 2.848q-0.576 0.576-0.576 1.408z"></path>
				</svg>
			</button>
			<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" type="submit" value="submit" aria-label="Submit">
				<svg fill="currentColor" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
					<path d="M256,0C114.618,0,0,114.618,0,256s114.618,256,256,256s256-114.618,256-256S397.382,0,256,0z M256,469.333
						c-117.818,0-213.333-95.515-213.333-213.333S138.182,42.667,256,42.667S469.333,138.182,469.333,256S373.818,469.333,256,469.333
						z"/>
					<path d="M401.067,268.761c0.227-0.303,0.462-0.6,0.673-0.915c0.203-0.304,0.379-0.619,0.565-0.93
						c0.171-0.286,0.35-0.565,0.508-0.86c0.17-0.317,0.313-0.643,0.466-0.967c0.145-0.308,0.299-0.61,0.43-0.925
						c0.13-0.314,0.235-0.635,0.349-0.953c0.122-0.338,0.251-0.672,0.356-1.018c0.096-0.318,0.167-0.642,0.248-0.964
						c0.089-0.353,0.188-0.701,0.259-1.061c0.074-0.372,0.117-0.748,0.171-1.122c0.045-0.314,0.105-0.622,0.136-0.941
						c0.138-1.4,0.138-2.81,0-4.21c-0.031-0.318-0.091-0.627-0.136-0.941c-0.054-0.375-0.097-0.75-0.171-1.122
						c-0.071-0.359-0.17-0.708-0.259-1.061c-0.081-0.322-0.152-0.645-0.248-0.964c-0.105-0.346-0.234-0.68-0.356-1.018
						c-0.114-0.318-0.219-0.639-0.349-0.953c-0.131-0.315-0.284-0.618-0.43-0.925c-0.153-0.324-0.296-0.65-0.466-0.967
						c-0.158-0.294-0.337-0.574-0.508-0.86c-0.186-0.311-0.362-0.626-0.565-0.93c-0.211-0.315-0.446-0.612-0.673-0.915
						c-0.19-0.254-0.366-0.514-0.569-0.761c-0.443-0.54-0.91-1.059-1.403-1.552c-0.004-0.004-0.006-0.008-0.01-0.011l-85.333-85.333
						c-8.331-8.331-21.839-8.331-30.17,0s-8.331,21.839,0,30.17l48.915,48.915H128c-11.782,0-21.333,9.551-21.333,21.333
						s9.551,21.333,21.333,21.333h204.497l-48.915,48.915c-8.331,8.331-8.331,21.839,0,30.17c8.331,8.331,21.839,8.331,30.17,0
						l85.333-85.333c0.004-0.004,0.006-0.008,0.01-0.011c0.493-0.494,0.96-1.012,1.403-1.552
						C400.701,269.275,400.877,269.014,401.067,268.761z"/>
				</svg>
			</button>
		</div>
	</form>
</dialog>