<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('toggleMessage');
	}
</script>

<header class="flex gap-4 items-center p-4 h-28 shadow-2xl scroll-m-2.5">
	<a href="/" class="h-full logo"
		><img src="/LOGO.png" alt="My Logo" class="h-full rounded-l-2xl" /></a
	>
	<div class="flex flex-col">
		<nav class="flex items-center gap-2">
			<a href="/">home</a><a href="/projects">projects</a>
		</nav>
	</div>
</header>

<style>
	a::before {
		content: '| ';
	}

	a:first-child::before {
		content: '';
	}
</style>
