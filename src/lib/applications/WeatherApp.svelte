<script lang="ts">
	import { app as weather } from "./WeatherApp.svelte.ts";
	import InputDialog from "$lib/utils/InputDialog.svelte";
	import InfoDialog from "$lib/utils/InfoDialog.svelte";
	import ErrorDialog from "$lib/utils/ErrorDialog.svelte";
</script>

<div class="relative h-full w-full">
	<div class="h-full w-full overflow-y-auto flex flex-row font-mono text-base">
		<div class="flex-2/12">
			<p>sidebar</p>
		</div>
		<div class="flex-10/12">
			<p>main content</p>
		</div>
	</div>

	<InputDialog bind:this={weather.inputDialog} />
	<InfoDialog bind:this={weather.infoDialog} />
	<ErrorDialog bind:this={weather.errorDialog} />
</div>