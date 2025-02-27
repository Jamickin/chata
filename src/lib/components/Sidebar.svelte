<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('toggleMessage');
	}
	let isSidebarVisible = $state(false);

	function toggleSidebar() {
		isSidebarVisible = !isSidebarVisible;
	}
</script>

<nav
	class="{isSidebarVisible
		? 'w-[33.3333%]'
		: 'w-0'} transition-transform glass fixed top-0 left-0 h-full flex flex-col"
>
	<button class="toggle-button absolute top-0 left-0 text-2xl" onclick={toggleSidebar}>
		{#if isSidebarVisible}
			X
		{:else}
			=
		{/if}
	</button>
	{#if isSidebarVisible}<div class="flex flex-col items-center">
			<a onclick={toggleSidebar} href="/"><img src="/LOGO.png" alt="My Logo" class="w-full" /></a>
			<button onclick={handleClick}>WELCOME</button>
			<a onclick={toggleSidebar} href="/" class="logo">home</a>
			<a onclick={toggleSidebar} href="/projects" class="logo">projects</a>
		</div>{/if}
</nav>

<style>
	.toggle-button {
		transform: translateX(calc(var(--sidebar-width, 0) - 100%));
		transition: transform 0.3s ease;
	}

	nav.w-1/3 .toggle-button {
		--sidebar-width: 33.3333%;
	}
</style>
