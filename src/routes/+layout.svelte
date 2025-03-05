<script>
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Topbar from '$lib/components/Topbar.svelte';
	import { routes } from '../lib/routes.js';

	let isMobile = $state(false);

	$effect(() => {
		if (typeof window !== 'undefined') {
			isMobile = window.innerWidth <= 768;
			const updateWidth = () => (isMobile = window.innerWidth <= 768);
			window.addEventListener('resize', updateWidth);
			return () => window.removeEventListener('resize', updateWidth);
		}
	});

	let { children } = $props();
</script>

{#if !isMobile}
	<Topbar {routes} />
{:else}
	<Sidebar {routes} />
{/if}

<main class="{!isMobile ? 'mt-36' : 'mt-12'} px-8">
	{@render children()}
</main>
<footer class="bg-slate-50 w-full dark:bg-slate-800 px-2">
	<p>'This is the start of something brand new and exciting'</p>
	<p>JW - 2025</p>
</footer>

<style>
</style>
