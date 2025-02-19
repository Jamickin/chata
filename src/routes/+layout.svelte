<script>
	import '../app.css';

	import Header from '../components/Header.svelte';
	import Sidebar from '../components/Sidebar.svelte';
	import { onMount } from 'svelte';

	let isMobile = $state(false);

	function checkWindowWidth() {
		isMobile = window.innerWidth <= 768;
	}

	onMount(() => {
		checkWindowWidth();
		window.addEventListener('resize', checkWindowWidth);
		return () => window.removeEventListener('resize', checkWindowWidth);
	});
	let { children } = $props();
</script>

{#if isMobile}
	<Sidebar />
{:else}
	<Header />
{/if}

<main class="bg-[#f0f0f0a9] m-8 rounded-3xl shadow-xl">
	{@render children()}
	<footer class="w-full p-4 text-center text-gray-500 italic">
		<p>'This is the start of something brand new and exciting'</p>
		<p>2025 - JW</p>
	</footer>
</main>

<style>
</style>
