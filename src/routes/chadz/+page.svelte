<script>
	import { routes } from '$lib/routes.js';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import AnimatedBanner from '$lib/components/AnimatedBanner.svelte';
	import FeatureCard from '$lib/components/FeatureCard.svelte';
	import StatsDisplay from '$lib/components/StatsDisplay.svelte';
	import TestimonialCarousel from '$lib/components/TestimonialCarousel.svelte';
	import NotificationBell from '$lib/components/NotificationBell.svelte';
</script>

<!-- Background animation -->
<AnimatedBackground variant="particles" opacity={0.1} colorScheme="blue" />

<!-- Notification Bell -->
<NotificationBell />

<!-- Hero Section -->
<AnimatedBanner
	title="Welcome to Chadz Community"
	subtitle="Connect, share, and accomplish more together"
	background="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
/>

<!-- Main Content -->
<div class="max-w-6xl mx-auto px-4 py-8">
	<!-- Feature Cards -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-center mb-10 text-white">Our Features</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<!-- Tatiana's Tidbits -->
			<FeatureCard
				title="Tatiana's Tidbits"
				description="Explore Tatiana's collection of thoughts, ideas, and creative content."
				icon="message"
				color="pink"
			>
				<div class="mt-4">
					<a href="/tati" class="text-sm font-medium text-blue-400 hover:underline">
						Visit Tatiana's Page →
					</a>
				</div>
			</FeatureCard>

			<!-- Toni's Timeline -->
			<FeatureCard
				title="Toni's Timeline"
				description="Join the conversation in Toni's community timeline with password-protected posts."
				icon="calendar"
				color="purple"
			>
				<div class="mt-4">
					<a href="/toni" class="text-sm font-medium text-blue-400 hover:underline">
						Visit Toni's Timeline →
					</a>
				</div>
			</FeatureCard>

			<!-- Todo List -->
			<FeatureCard
				title="Todo List"
				description="Keep track of tasks with our secure, password-protected todo list."
				icon="todo"
				color="green"
			>
				<div class="mt-4">
					<a href="/miscpro" class="text-sm font-medium text-blue-400 hover:underline">
						Open Todo List →
					</a>
				</div>
			</FeatureCard>

			<!-- Currency Converter -->
			<FeatureCard
				title="Currency Converter"
				description="Convert between currencies with real-time exchange rates."
				icon="currency"
				color="blue"
			>
				<div class="mt-4">
					<a href="/miscpro" class="text-sm font-medium text-blue-400 hover:underline">
						Open Converter →
					</a>
				</div>
			</FeatureCard>

			<!-- Message Board -->
			<FeatureCard
				title="Message Board"
				description="Share your thoughts and connect with other community members."
				icon="message"
				color="indigo"
			>
				<div class="mt-4">
					<a href="/toni" class="text-sm font-medium text-blue-400 hover:underline">
						View Messages →
					</a>
				</div>
			</FeatureCard>

			<!-- Password Protection -->
			<FeatureCard
				title="Security"
				description="All your posts and todos can be password protected for extra security."
				icon="settings"
				color="red"
			>
				<div class="mt-4">
					<p class="text-sm text-slate-400">
						Look for the <span class="font-mono bg-slate-700 px-1 rounded">#</span> symbol for protected
						items
					</p>
				</div>
			</FeatureCard>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="mb-16">
		<StatsDisplay>
			<svelte:fragment slot="title">Live Community Stats</svelte:fragment>
		</StatsDisplay>

		<div class="mt-4 text-center text-sm text-slate-400">
			<p>These statistics are pulled directly from our database in real-time</p>
		</div>
	</section>

	<!-- Testimonials Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-center mb-10 text-white">Community Feedback</h2>
		<TestimonialCarousel />
		<div class="mt-4 text-center text-sm text-slate-400">
			<p>
				Share your experience with our platform and help us improve! Your testimonial will be
				displayed here after review.
			</p>
		</div>
	</section>

	<!-- Call to Action -->
	<section class="mb-16 text-center">
		<div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 shadow-lg">
			<h2 class="text-3xl font-bold text-white mb-4">Join Our Community Today</h2>
			<p class="text-indigo-100 mb-6 max-w-2xl mx-auto">
				Connect with like-minded individuals, share your thoughts, and stay organized with our suite
				of tools.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<a
					href="/toni"
					class="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
				>
					Post a Message
				</a>
				<a
					href="/miscpro"
					class="bg-indigo-700 text-white hover:bg-indigo-800 px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
				>
					Try Our Tools
				</a>
			</div>
		</div>
	</section>

	<!-- Quick Links -->
	<section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		{#each routes.filter((route) => route.path !== '/') as route}
			<a
				href={route.path}
				class="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
			>
				<span
					class="text-lg font-medium text-white group-hover:group-hover:text-blue-400 transition-colors"
					>{route.name}</span
				>
				<span class="text-sm text-slate-400 mt-2">Explore →</span>
			</a>
		{/each}
	</section>
</div>
