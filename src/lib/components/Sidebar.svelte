<script>
	import { routes } from '../routes.js';
	let openSidebar = $state(true);
</script>

<header
	class="h-full text-center {openSidebar
		? ' w-1/3'
		: ''} fixed top-0 left-0 backdrop-blur-2xl z-50 py-12"
>
	{#if openSidebar}
		<button
			class="absolute top-0 right-0"
			onclick={() => {
				openSidebar = !openSidebar;
			}}>x</button
		>
		<h3>Chadz</h3>
		<nav class="flex flex-col w-full gap-4 my-4">
			{#each routes as route}
				<a
					onclick={() => {
						openSidebar = !openSidebar;
					}}
					href={route.path}>{route.name}</a
				>
			{/each}
		</nav>
	{:else}
		<button
			class="absolute top-0 left-0"
			onclick={() => {
				openSidebar = !openSidebar;
			}}>x</button
		>
	{/if}
</header>

<style>
</style>
