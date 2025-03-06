<script>
	import { routes } from '../routes';
</script>

<header class="backdrop-blur-3xl fixed top-0 left-0 w-full p-4">
	<h1>Welcome To Chadz</h1>
	<nav class="flex gap-4">
		{#each routes as route}
			<a href={route.path}>{route.name}</a>
		{/each}
	</nav>
</header>

<style>
</style>
