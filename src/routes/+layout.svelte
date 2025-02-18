<script>
	import '../app.css';

	import Header from '../components/Header.svelte';
	import Sidebar from '../components/Sidebar.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let mobileMenu = false;
	let isMobile = $state(false);

	function checkWindowWidth() {
		isMobile = window.innerWidth <= 1026;
	}

	onMount(() => {
		checkWindowWidth();
		window.addEventListener('resize', checkWindowWidth);
		return () => window.removeEventListener('resize', checkWindowWidth);
	});
</script>

{#if isMobile}
	<Sidebar />
{:else}
	<Header />
{/if}

<main class="bg-[#f0f0f0] m-4 rounded-2xl shadow-xl">{@render children()}</main>
<footer class="w-full p-4 bg-[#f0f0f0]">
	<p>This is the start of something brand new and exciting</p>
</footer>

<style></style>
