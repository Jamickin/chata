<script>
	import { routes } from '../routes';
</script>

<header class="fixed top-0 left-0 w-full p-4 z-30 bg-slate-800/80 backdrop-blur-lg shadow-sm">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-3xl md:text-4xl ml-12">Welcome To Chadz</h1>
		<nav class="hidden md:flex gap-2 mt-4 flex-wrap">
			{#each routes as route}
				<a href={route.path} class="md:w-auto">{route.name}</a>
			{/each}
		</nav>
	</div>
</header>
