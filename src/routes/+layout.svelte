<script>
	import '../app.css';

	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { onMount } from 'svelte';
	import Message from '$lib/components/Message.svelte';

	let message = $state(true);

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

{#if message === false}
	{#if isMobile}
		<Sidebar />
	{:else}
		<Header />
	{/if}

	<main class="m-8">
		{@render children()}
		<footer class="w-full p-4 text-center text-gray-500 italic">
			<p>'This is the start of something brand new and exciting'</p>
			<p>2025 - JW</p>
		</footer>
	</main>
{:else}
	<Message />
{/if}

<style>
</style>
