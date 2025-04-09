<script>
	import { routes } from '../routes.js';
	let openSidebar = $state(false);

	function toggleSidebar() {
		openSidebar = !openSidebar;
	}
</script>

<button class="side-button" aria-label="Toggle menu" on:click={toggleSidebar}>
	{openSidebar ? 'X' : '☰'}
</button>

<aside class="mobile-menu {openSidebar ? 'mobile-menu-open' : 'mobile-menu-closed'} w-64">
	<div class="py-4">
		<h3 class="text-2xl mb-4">Chadz</h3>
		<nav class="flex flex-col w-full gap-3">
			{#each routes as route}
				<a href={route.path} on:click={toggleSidebar}>
					{route.name}
				</a>
			{/each}
		</nav>
	</div>
</aside>

<!-- Add an overlay when sidebar is open on mobile -->
{#if openSidebar}
	<div
		class="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
		on:click={toggleSidebar}
		aria-hidden="true"
	></div>
{/if}
