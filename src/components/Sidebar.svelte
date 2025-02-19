<script>
	let isSidebarVisible = true;

	function toggleSidebar() {
		isSidebarVisible = !isSidebarVisible;
	}
</script>

<button class="toggle-button" on:click={toggleSidebar}>
	{#if isSidebarVisible}
		Hide Sidebar
	{:else}
		Show Sidebar
	{/if}
</button>

<nav class:sidebar-hidden={!isSidebarVisible} class="sidebar w-1/4 p-4 bg-[#f0f0f0] fixed h-full">
	<ul>
		<img src="/LOGO.png" alt="My Logo" class="w-full" />
		<h1 class="lexend-bold">This is my website.</h1>
		<li><a href="/" class="logo">home</a></li>
		<li><a href="/projects" class="logo">projects</a></li>
	</ul>
</nav>

<style>
	.sidebar {
		transition: transform 0.3s ease-in-out;
	}
	.sidebar-hidden {
		transform: translateX(-100%);
	}
	.toggle-button {
		position: fixed;
		top: 1rem;
		left: 1rem;
		background-color: #007bff;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		cursor: pointer;
		border-radius: 0.25rem;
		z-index: 999;
	}
</style>
