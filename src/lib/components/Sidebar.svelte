<script>
	let isSidebarVisible = false;

	function toggleSidebar() {
		isSidebarVisible = !isSidebarVisible;
	}
</script>

<nav
	class:sidebar-hidden={!isSidebarVisible}
	class="transition w-1/3 glass fixed top-0 left-0 h-full flex flex-col"
>
	<button class="absolute -right-4 text-2xl" onclick={toggleSidebar}>
		{#if isSidebarVisible}
			X
		{:else}
			=
		{/if}
	</button>
	<div class="flex flex-col items-center">
		<a onclick={toggleSidebar} href="/"><img src="/LOGO.png" alt="My Logo" class="w-full" /></a>
		<h3 class="lexend-bold">Welcome</h3>
		<a onclick={toggleSidebar} href="/" class="logo">home</a>
		<a onclick={toggleSidebar} href="/projects" class="logo">projects</a>
	</div>
</nav>

<style>
	.sidebar-hidden {
		transform: translateX(-100%);
	}
</style>
