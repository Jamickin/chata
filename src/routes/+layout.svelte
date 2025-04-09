<script>
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Topbar from '$lib/components/Topbar.svelte';
	import DarkModeToggle from '$lib/components/DarkModeToggle.svelte';
	import NotificationBell from '$lib/components/NotificationBell.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let pageLoaded = $state(false);
	let currentPath = $state('/');

	onMount(() => {
		// Add a small delay to ensure components are registered
		setTimeout(() => {
			pageLoaded = true;
			currentPath = window.location.pathname;
		}, 100);

		// Listen for route changes
		const handleRouteChange = () => {
			currentPath = window.location.pathname;
		};

		window.addEventListener('popstate', handleRouteChange);

		return () => {
			window.removeEventListener('popstate', handleRouteChange);
		};
	});
</script>

<!-- Always include the sidebar (it's hidden by default on mobile) -->
<Sidebar />

<!-- Always show the topbar (it hides the nav on mobile) -->
<Topbar />

<!-- Always include DarkModeToggle on all pages for consistent behavior -->
<DarkModeToggle />

<!-- Notification Bell - Only visible on non-home pages -->
{#if pageLoaded && currentPath !== '/'}
	<NotificationBell />
{/if}

<!-- Main content with smooth fade-in animation -->
<main class="max-w-7xl mx-auto px-4 pt-42 pb-20 animate-fade-in">
	{@render children()}
</main>

<footer class="footer">
	<div class="max-w-7xl mx-auto px-4">
		<p>"This is the start of something brand new and exciting" JW, 2025</p>
	</div>
</footer>
