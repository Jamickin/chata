<script>
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Topbar from '$lib/components/Topbar.svelte';

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
	<Topbar />
{:else}
	<Sidebar />
{/if}

<main class={!isMobile ? 'mt-36' : 'mt-8'}>
	{@render children()}
	<footer class="w-full p-4 text-center text-gray-500 italic">
		<p>'This is the start of something brand new and exciting'</p>
		<p>JW - 2025</p>
	</footer>
</main>

<style>
</style>
