<script lang="ts">
	import { app } from "./FilesApp";
</script>

<div class="h-full w-full overflow-y-auto flex flex-col">
	<div class="">
		<!-- Back and Forth arrows -->

		<!-- File path to dir -->
		<input 
			bind:value={app.navPath}
			class=""
		/>
	</div>
	<div class="flex-1">
		<!-- List view of files -->
		{#each app.getCwd().getAll() as object, index}
			{#if "dirs" in object}
				<!-- Display Directory -->
				<div class="">
					<!-- Icon -->
					<!-- Name -->
					<!-- Date Modified -->
					<!-- Size in reasonable byte size -->
				</div>
			{:else}
				<!-- Display File -->
				<div class="">
					<!-- Icon -->
					<!-- Name -->
					<!-- Date Modified -->
					<!-- Size in reasonable byte size -->
				</div>
			{/if}
		{/each}
	</div>
</div>