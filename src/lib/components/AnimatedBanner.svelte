<script>
	import { onMount } from 'svelte';

	let bannerRef;
	let observer;
	let visible = $state(false);

	// Use $props() instead of export
	let {
		title = 'Welcome to Chadz',
		subtitle = 'A collection of tools and community pages',
		background = 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
	} = $props();

	onMount(() => {
		// Set up intersection observer for animation
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visible = true;
						observer.disconnect();
					}
				});
			},
			{ threshold: 0.1 }
		);

		if (bannerRef) {
			observer.observe(bannerRef);
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});
</script>

<div bind:this={bannerRef} class="{background} relative overflow-hidden rounded-lg shadow-xl mb-8">
	<!-- Animated background decoration -->
	<div class="absolute inset-0 overflow-hidden">
		{#each Array(5) as _, i}
			<div
				class="absolute rounded-full bg-white/10 -z-0"
				style="
					width: {100 + i * 50}px; 
					height: {100 + i * 50}px; 
					top: {Math.sin(i * 0.5) * 50 + 50}%; 
					left: {i * 20 + 10}%; 
					animation: float {3 + i * 0.5}s ease-in-out infinite alternate;
					animation-delay: {i * 0.2}s;
				"
			></div>
		{/each}
	</div>

	<div class="relative z-10 px-6 py-12 md:py-16 lg:py-20 max-w-5xl mx-auto">
		<h1
			class="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4
				transform transition-all duration-1000
				{visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}"
		>
			{title}
		</h1>

		<p
			class="text-white/90 text-lg md:text-xl text-center max-w-2xl mx-auto
				transform transition-all duration-1000 delay-300
				{visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}"
		>
			{subtitle}
		</p>
	</div>
</div>

<style>
	@keyframes float {
		0% {
			transform: translateY(0) scale(1);
		}
		100% {
			transform: translateY(-20px) scale(1.1);
		}
	}
</style>
