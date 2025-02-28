<script>
	import { onMount } from 'svelte';
	let mobile = $state(false);
	let sidebarOpen = $state(false);

	onMount(() => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');
		mobile = mediaQuery.matches;
		mediaQuery.addEventListener('change', (e) => {
			mobile = e.matches;
		});
	});
</script>

<header
	class="flex fixed gap-4 items-center shadow-md backdrop-blur-3xl left-0 top-0 {mobile
		? 'h-full w-1/3'
		: 'w-full h-28'}"
>
	<nav class="flex items-center h-full w-full {mobile ? 'flex-col' : ''}">
		<a href="/" class={mobile ? 'w-full' : 'h-full'}>
			<img src="./LOGO.png" alt="Chadz Logo" class="h-full" />
		</a>
		<div class="flex items-center gap-8 h-full w-full {mobile ? 'flex-col ' : 'px-8'}">
			<a href="/" class={mobile ? 'p-2' : ''}>home</a>
			<a href="/tati" class={mobile ? 'p-2' : ''}>Tatiana's Tidbits</a>
			<a href="/toni" class={mobile ? 'p-2' : ''}>Toni's Timeline</a>
		</div>
	</nav>
</header>

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
</style>
