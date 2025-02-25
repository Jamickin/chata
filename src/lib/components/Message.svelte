<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('toggleMessage');
	}
</script>

<div class="backdrop-blur-xs p-8 flex items-center flex-col">
	<button class="text-4xl font-extrabold" onclick={handleClick}
		>WELCOME TO MY SHITTY WEBSITE :)</button
	>
	<p class="font-bold text-white">This is my attempt in making something beautiful</p>
</div>

<style>
	@keyframes fade-in {
		100% {
			opacity: 1;
		}
	}

	div {
		animation: fade-in 1200ms ease-in-out forwards;
		/* animation-delay: 1000ms; */
		opacity: 0;
	}
</style>
