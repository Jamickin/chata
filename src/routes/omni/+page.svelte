<script>
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import AnimatedBanner from '$lib/components/AnimatedBanner.svelte';
	import FeatureCard from '$lib/components/FeatureCard.svelte';
</script>

<!-- Background animation -->
<AnimatedBackground variant="particles" opacity={0.1} colorScheme="green" />

<!-- Hero Section -->
<AnimatedBanner
	title="Welcome to Omni"
	subtitle="Your family organization hub"
	background="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
/>

<!-- Main Content -->
<div class="max-w-6xl mx-auto px-4 py-8">
	<!-- Feature Cards -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-center mb-10 text-white">Family Features</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<!-- Chores -->
			<FeatureCard
				title="Chores"
				description="Track and assign household chores to family members with due dates and priorities."
				icon="todo"
				color="green"
			>
				<div class="mt-4">
					<a href="/omni/chores" class="text-sm font-medium text-emerald-400 hover:underline">
						Manage Chores →
					</a>
				</div>
			</FeatureCard>

			<!-- Grocery Lists -->
			<FeatureCard
				title="Grocery Lists"
				description="Shared grocery lists that the whole family can access and update."
				icon="message"
				color="blue"
			>
				<div class="mt-4">
					<a href="/omni/groceries" class="text-sm font-medium text-blue-400 hover:underline">
						View Grocery Lists →
					</a>
				</div>
			</FeatureCard>

			<!-- Rewards -->
			<FeatureCard
				title="Rewards & Badges"
				description="Gamify family tasks with rewards and achievement badges."
				icon="settings"
				color="purple"
			>
				<div class="mt-4">
					<a href="/omni/rewards" class="text-sm font-medium text-purple-400 hover:underline">
						View Rewards →
					</a>
				</div>
			</FeatureCard>

			<!-- Analytics -->
			<FeatureCard
				title="Analytics"
				description="Track family activity, completed chores, and productivity insights."
				icon="calendar"
				color="indigo"
			>
				<div class="mt-4">
					<a href="/omni/analytics" class="text-sm font-medium text-indigo-400 hover:underline">
						View Analytics →
					</a>
				</div>
			</FeatureCard>

			<!-- Recipes -->
			<FeatureCard
				title="Recipes"
				description="Store and share family recipes with ingredient lists and instructions."
				icon="message"
				color="pink"
			>
				<div class="mt-4">
					<p class="text-sm text-slate-400">Coming soon: Recipe management</p>
				</div>
			</FeatureCard>

			<!-- Workspaces -->
			<FeatureCard
				title="Workspaces"
				description="Create separate workspaces for different households or groups."
				icon="settings"
				color="red"
			>
				<div class="mt-4">
					<p class="text-sm text-slate-400">Coming soon: Multi-workspace support</p>
				</div>
			</FeatureCard>
		</div>
	</section>

	<!-- Info Banner -->
	<section class="mb-16 text-center">
		<div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-8 shadow-lg">
			<h2 class="text-3xl font-bold text-white mb-4">Omni Family Tracker</h2>
			<p class="text-emerald-100 mb-6 max-w-2xl mx-auto">
				All family tracking features are now live! Manage chores, groceries, rewards, and view
				analytics all in one place. Everything is saved to the cloud with Firebase.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<a
					href="/omni/chores"
					class="bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
				>
					Get Started →
				</a>
				<a
					href="/chadz"
					class="bg-emerald-700 text-white hover:bg-emerald-800 px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
				>
					Switch to Chadz →
				</a>
			</div>
		</div>
	</section>
</div>
