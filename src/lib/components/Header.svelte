<script>
	import { onMount } from 'svelte';
	let mobile = $state(false);
	let sidebarOpen = $state(true);

	onMount(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');
		mobile = mediaQuery.matches;
		mediaQuery.addEventListener('change', (e) => {
			mobile = e.matches;
		});
		$effect(() => (sidebarOpen = true));
	});
</script>

{#if sidebarOpen && mobile}
	<header
		class="flex fixed gap-4 items-center shadow-md backdrop-blur-3xl left-0 top-0
	{sidebarOpen ? 'translate-x-0' : '-translate-x-4'}
	{mobile ? 'h-full w-1/3' : 'w-full h-28'}"
	>
		<button
			onclick={() => {
				sidebarOpen = !sidebarOpen;
			}}
			class="absolute top-0 -right-12 p-2 text-white bg-gray-800 hover:bg-gray-600 rounded-full"
		>
			x
		</button>
		<nav class="flex items-center h-full w-full {mobile ? 'flex-col' : ''}">
			<div class="flex items-center gap-8 h-full w-full {mobile ? 'flex-col ' : 'px-8'}">
				<a href="/" class={mobile ? 'p-2' : ''}>home</a>
				<a href="/tati" class={mobile ? 'p-2' : ''}>Tatiana's Tidbits</a>
				<a href="/toni" class={mobile ? 'p-2' : ''}>Toni's Timeline</a>
			</div>
		</nav>
	</header>
{:else}
	<button
		onclick={() => {
			sidebarOpen = !sidebarOpen;
		}}
		class="absolute top-0 left-0 p-2 text-white bg-gray-800 hover:bg-gray-600 rounded-full"
	>
		x
	</button>
{/if}

<style>
	div > a {
		@apply border w-full text-center uppercase;
	}

	a:hover {
		background-color: rgb(255, 115, 0);
		color: white;
		transition: all 0.7s;
		border: none;
	}

	header {
		transition: translate 12000 ease-in-out;
	}
</style>
