<script>
	import { routes } from '../routes.js';
	let openSidebar = $state(true);

	function toggleSidebar() {
		openSidebar = !openSidebar;
	}
</script>

{#if openSidebar}
	<header
		class="flex flex-col h-full fixed gap-4 items-center shadow-md backdrop-blur-3xl w-1/3 left-0 top-0 py-12"
	>
		<button onclick={toggleSidebar} class="absolute top-0 right-0">x</button>
		<nav class="flex flex-col items-center w-full p-2 gap-8">
			{#each routes as route}
				<a onclick={toggleSidebar} href={route.path}>{route.name}</a>
			{/each}
		</nav>
	</header>
{:else}
	<button onclick={toggleSidebar} class="fixed top-0 left-0">x</button>
{/if}

<style>
	a {
		@apply hover:underline border h-full w-full text-center uppercase;
	}
</style>
