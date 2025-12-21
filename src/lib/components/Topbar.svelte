<script>
	import { routes, omniRoutes, chadzRoutes } from '../routes';
	import { onMount } from 'svelte';

	let currentPath = $state('/');
	let currentMode = $state('');

	onMount(() => {
		currentPath = window.location.pathname;
		updateMode();

		const handleRouteChange = () => {
			currentPath = window.location.pathname;
			updateMode();
		};

		window.addEventListener('popstate', handleRouteChange);
		return () => window.removeEventListener('popstate', handleRouteChange);
	});

	function updateMode() {
		if (currentPath.startsWith('/omni')) {
			currentMode = 'omni';
		} else if (currentPath.startsWith('/chadz') || currentPath.startsWith('/tati') || currentPath.startsWith('/toni') || currentPath.startsWith('/miscpro')) {
			currentMode = 'chadz';
		} else {
			currentMode = '';
		}
	}

	$: displayRoutes = currentMode === 'omni' ? omniRoutes : currentMode === 'chadz' ? chadzRoutes : routes;
	$: headerTitle = currentMode === 'omni' ? 'Welcome to Omni' : currentMode === 'chadz' ? 'Welcome To Chadz' : 'Platform';
</script>

<header class="fixed top-0 left-0 w-full p-4 z-10 bg-slate-800/80 backdrop-blur-lg shadow-sm">
	<div class="max-w-7xl mx-auto">
		<div class="flex items-center justify-between ml-12">
			<h1 class="text-3xl md:text-4xl">{headerTitle}</h1>
			{#if currentMode}
				<div class="hidden md:flex gap-2 text-sm">
					{#if currentMode === 'chadz'}
						<a href="/omni" class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full hover:bg-emerald-500/30 transition">
							Switch to Omni →
						</a>
					{:else}
						<a href="/chadz" class="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full hover:bg-indigo-500/30 transition">
							Switch to Chadz →
						</a>
					{/if}
				</div>
			{/if}
		</div>
		<nav class="hidden md:flex gap-2 mt-4 flex-wrap">
			{#each displayRoutes as route}
				<a href={route.path} class="md:w-auto" class:active={currentPath === route.path}>{route.name}</a>
			{/each}
		</nav>
	</div>
</header>
