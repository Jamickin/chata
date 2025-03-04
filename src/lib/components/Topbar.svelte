<script>
	import { routes } from '../routes.js';
</script>

<header
	class="flex fixed gap-4 items-center shadow-md justify-between backdrop-blur-3xl w-full left-0 top-0 px-4"
>
	<h3>Welcome to Chadz</h3>
	<nav class="flex items-center h-full w-full">
		<div class="flex items-center h-full w-full justify-around gap-8 py-8">
			{#each routes as route}
				<a href={route.path}>{route.name}</a>
			{/each}
		</div>
	</nav>
</header>

<style>
	div > a {
		@apply hover:underline border h-full w-full text-center uppercase;
	}
</style>
