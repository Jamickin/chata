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

<main class={!isMobile ? 'my-24' : 'my-6'}>
	{@render children()}
</main>
<footer class="w-full fixed left-0 bottom-0 text-center text-slate-50 backdrop-blur-3xl">
	<p>'This is the start of something brand new and exciting'</p>
	<p>JW - 2025</p>
</footer>

<style>
</style>
