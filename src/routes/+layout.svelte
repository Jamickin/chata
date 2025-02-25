<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Message from '$lib/components/Message.svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let isMobile = $state(false);
	let message = $state(false);
	let { children } = $props();

	function checkWindowWidth() {
		isMobile = window.innerWidth <= 768;
	}

	function toggleMessage() {
		message = !message;
		localStorage.setItem('message', JSON.stringify(message));
	}

	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			const storedMessage = localStorage.getItem('message');
			if (storedMessage !== null) {
				message = JSON.parse(storedMessage);
			}
		}
		checkWindowWidth();
		window.addEventListener('resize', checkWindowWidth);
		return () => window.removeEventListener('resize', checkWindowWidth);
	});
</script>

{#if isMobile}
	<Sidebar />
{:else}
	<Header on:toggleMessage={toggleMessage} />
{/if}

<main class="m-8" transition:fade>
	{@render children()}
	<footer class="w-full p-4 text-center text-gray-500 italic">
		<p>'This is the start of something brand new and exciting'</p>
		<p>2025 - JW</p>
	</footer>
</main>
{#if message}
	<main
		class="fixed top-0 left-0 mx-auto h-dvh w-screen flex justify-center items-center backdrop-blur-xs overflow-hidden"
	>
		<Message on:toggleMessage={toggleMessage} />
	</main>
{/if}

<style>
</style>
