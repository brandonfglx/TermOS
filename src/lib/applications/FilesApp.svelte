<script lang="ts">
	import { app as files } from "./FilesApp.svelte.ts";
</script>

<!-- SVGs are licensed under CC Attribution 4.0 International from https://www.svgrepo.com/author/Dazzle%20UI/ and MIT License from Zest -->
<div class="h-full w-full overflow-y-auto flex flex-col">
	<div class="bg-term-light-bg dark:bg-term-dark-bg font-mono text-base flex flex-row">
		<!-- Back and Forth arrows -->
		<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Back" onclick={() => {files.nav(-1)}}>
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fill-rule="evenodd" clip-rule="evenodd" d="M11.707 4.293a1 1 0 0 1 0 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l5.293 5.293a1 1 0 0 1-1.414 1.414l-7-7a1 1 0 0 1 0-1.414l7-7a1 1 0 0 1 1.414 0z" fill="currentColor"/>
			</svg>
		</button>
		<button class="w-8 cursor-pointer bg-transparent border-none p-0 flex items-center justify-center" aria-label="Forward" onclick={() => {files.nav(1)}}>
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
				<path fill-rule="evenodd" clip-rule="evenodd" d="M12.293 4.293a1 1 0 0 1 1.414 0l7 7a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414-1.414L17.586 13H4a1 1 0 1 1 0-2h13.586l-5.293-5.293a1 1 0 0 1 0-1.414z" fill="currentColor"/>
			</svg>
		</button>

		<!-- File path to dir -->
		<input 
			type="text"
			class="bg-term-light-bg dark:bg-term-dark-bg flex-1 border-none outline-none focus:outline-none focus:ring-0"
			value={files.navPath}
			oninput={(event) => files.preview(event.currentTarget.value)}
			onkeydown={(event) => {
				if (event.key === "Enter") {
					files.go();
				}
			}}
		/>
	</div>
	<div class="w-full h-full flex-1 font-mono text-base flex flex-col">
		{#if !files.searchedDir}
			<div class="w-full h-full flex flex-col justify-center items-center gap-4">
				<svg class="w-24" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
					<path d="M6,0C2.6862793,0,0,2.6862793,0,6s2.6862793,6,6,6s6-2.6862793,6-6S9.3137207,0,6,0z M6.5,9.5h-1v-1h1V9.5z M7.2651367,6.1738281C6.7329102,6.5068359,6.5,6.6845703,6.5,7v0.5h-1V7c0-0.9023438,0.7138672-1.3486328,1.2348633-1.6738281  C7.2670898,4.9931641,7.5,4.8154297,7.5,4.5c0-0.5517578-0.4487305-1-1-1h-1c-0.5512695,0-1,0.4482422-1,1V5h-1V4.5  c0-1.1025391,0.8969727-2,2-2h1c1.1030273,0,2,0.8974609,2,2C8.5,5.4023438,7.7861328,5.8486328,7.2651367,6.1738281z" fill="currentColor"/>
				</svg>
				<h1>"{files.navPath}" doesn't exist!</h1>
			</div>
		{:else if files.searchedDir.getAll().length === 0}
			<div class="w-full h-full flex flex-col justify-center items-center gap-4">
				<svg class="w-24" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
					<path d="M6,0C2.6862793,0,0,2.6862793,0,6s2.6862793,6,6,6s6-2.6862793,6-6S9.3137207,0,6,0z M6.5,9.5h-1v-1h1V9.5z M7.2651367,6.1738281C6.7329102,6.5068359,6.5,6.6845703,6.5,7v0.5h-1V7c0-0.9023438,0.7138672-1.3486328,1.2348633-1.6738281  C7.2670898,4.9931641,7.5,4.8154297,7.5,4.5c0-0.5517578-0.4487305-1-1-1h-1c-0.5512695,0-1,0.4482422-1,1V5h-1V4.5  c0-1.1025391,0.8969727-2,2-2h1c1.1030273,0,2,0.8974609,2,2C8.5,5.4023438,7.7861328,5.8486328,7.2651367,6.1738281z" fill="currentColor"/>
				</svg>
				<h1>"{files.searchedDir.getPath()}" doesn't contain any files or directories!</h1>
			</div>
		{:else}
			<!-- Column Titles -->
			<div class="w-full flex flex-row items-center font-mono text-base">
				<div class="w-12 m-4 shrink-0"></div>
				<div class="flex-1 flex flex-row justify-around items-center">
					<p>Name</p>
					<p>Date Modified</p>
					<p>Size</p>
				</div>
			</div>
			{#each files.searchedDir.getAll() as object, index}
				{#if "dirs" in object}
					<!-- Directory -->
					<button type="button" class="w-full text-left text-inherit font-inherit p-0 m-0 bg-transparent border-none appearance-none cursor-pointer flex flex-row items-center" onclick={() => files.open(index)}>
						<svg class="w-12 m-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3 8.2C3 7.07989 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H9.67452C10.1637 5 10.4083 5 10.6385 5.05526C10.8425 5.10425 11.0376 5.18506 11.2166 5.29472C11.4184 5.4184 11.5914 5.59135 11.9373 5.93726L12.0627 6.06274C12.4086 6.40865 12.5816 6.5816 12.7834 6.70528C12.9624 6.81494 13.1575 6.89575 13.3615 6.94474C13.5917 7 13.8363 7 14.3255 7H17.8C18.9201 7 19.4802 7 19.908 7.21799C20.2843 7.40973 20.5903 7.71569 20.782 8.09202C21 8.51984 21 9.0799 21 10.2V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.07989 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<div class="flex-1 flex flex-row justify-around items-center">
							<p>{object.name}</p>
							<p>{new Date(object.metadata.dateModified).toLocaleString()}</p>
							<p>{files.convertBytes(object.metadata.size)}</p>
						</div>
					</button>
				{:else}
					<!-- File -->
					<button type="button" class="w-full text-left text-inherit font-inherit p-0 m-0 bg-transparent border-none appearance-none cursor-pointer flex flex-row items-center" onclick={() => files.open(index)}>
						<svg class="w-12 m-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 9V17.8C19 18.9201 19 19.4802 18.782 19.908C18.5903 20.2843 18.2843 20.5903 17.908 20.782C17.4802 21 16.9201 21 15.8 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.0799 3 8.2 3H13M19 9L13 3M19 9H14C13.4477 9 13 8.55228 13 8V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<div class="flex-1 flex flex-row justify-around items-center">
							<p>{object.name}</p>
							<p>{new Date(object.metadata.dateModified).toLocaleString()}</p>
							<p>{files.convertBytes(object.metadata.size)}</p>
						</div>
					</button>
				{/if}
			{/each}
		{/if}
	</div>
</div>