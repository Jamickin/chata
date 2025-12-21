<script>
	import { routes, omniRoutes, chadzRoutes } from '../routes.js';
	import { page } from '$app/stores';

	let openSidebar = $state(false);

	function toggleSidebar() {
		openSidebar = !openSidebar;
	}

	let currentMode = $derived.by(() => {
		const path = $page.url.pathname;
		if (path.startsWith('/omni')) return 'omni';
		if (path.startsWith('/chadz') || path.startsWith('/tati') || path.startsWith('/toni') || path.startsWith('/miscpro')) return 'chadz';
		return '';
	});

	let displayRoutes = $derived(currentMode === 'omni' ? omniRoutes : currentMode === 'chadz' ? chadzRoutes : routes);
	let modeTitle = $derived(currentMode === 'omni' ? 'Omni' : currentMode === 'chadz' ? 'Chadz' : 'Menu');
</script>

<button class="side-button" aria-label="Toggle menu" onclick={toggleSidebar}>
	{openSidebar ? 'X' : '☰'}
</button>

<aside class="mobile-menu {openSidebar ? 'mobile-menu-open' : 'mobile-menu-closed'} w-64">
	<div class="py-4">
		<h3 class="text-2xl mb-4">{modeTitle}</h3>

		<!-- Mode Switcher -->
		{#if currentMode}
			<div class="mb-4 p-3 bg-slate-700/50 rounded-lg">
				<p class="text-xs text-slate-400 mb-2">Switch Mode:</p>
				<div class="flex gap-2">
					{#if currentMode === 'chadz'}
						<a href="/omni" class="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full hover:bg-emerald-500/30 transition">
							→ Omni
						</a>
					{:else}
						<a href="/chadz" class="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full hover:bg-indigo-500/30 transition">
							→ Chadz
						</a>
					{/if}
					<a href="/" class="text-xs px-3 py-1 bg-slate-600 text-slate-300 rounded-full hover:bg-slate-500 transition">
						Mode Select
					</a>
				</div>
			</div>
		{/if}

		<nav class="flex flex-col w-full gap-3">
			{#each displayRoutes as route}
				<a href={route.path} onclick={toggleSidebar} class:active={$page.url.pathname === route.path}>
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
		onclick={toggleSidebar}
		aria-hidden="true"
	></div>
{/if}
