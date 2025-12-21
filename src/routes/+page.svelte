<script>
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
</script>

<!-- Background animation -->
<AnimatedBackground variant="particles" opacity={0.15} colorScheme="purple" />

<!-- Mode Selection Screen -->
<div class="min-h-screen flex items-center justify-center px-4">
	<div class="max-w-6xl w-full">
		<!-- Header -->
		<div class="text-center mb-16">
			<h1 class="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
				Welcome to the Platform
			</h1>
			<p class="text-xl text-slate-300 animate-fade-in" style="animation-delay: 0.2s">
				Choose your experience
			</p>
		</div>

		<!-- Mode Cards -->
		<div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
			<!-- Omni Mode -->
			<a
				href="/omni"
				class="group relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 rounded-2xl p-8 hover:border-emerald-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20"
			>
				<div class="relative z-10">
					<div
						class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
					>
						<svg
							class="w-10 h-10 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
					</div>

					<h2 class="text-3xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
						Omni
					</h2>
					<p class="text-slate-300 mb-6">
						Family organization and tracking. Manage chores, groceries, rewards, and stay organized
						together.
					</p>

					<div class="flex flex-wrap gap-2">
						<span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm"
							>Chores</span
						>
						<span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm"
							>Groceries</span
						>
						<span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm"
							>Rewards</span
						>
						<span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm"
							>Analytics</span
						>
					</div>
				</div>

				<div
					class="absolute bottom-4 right-4 text-emerald-400 group-hover:translate-x-2 transition-transform"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</div>
			</a>

			<!-- Chadz Mode -->
			<a
				href="/chadz"
				class="group relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 rounded-2xl p-8 hover:border-indigo-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20"
			>
				<div class="relative z-10">
					<div
						class="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
					>
						<svg
							class="w-10 h-10 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					</div>

					<h2 class="text-3xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
						Chadz
					</h2>
					<p class="text-slate-300 mb-6">
						Community platform. Connect, share, and accomplish more together with friends and family.
					</p>

					<div class="flex flex-wrap gap-2">
						<span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
							>Messages</span
						>
						<span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">Todos</span
						>
						<span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
							>Timeline</span
						>
						<span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">Tools</span
						>
					</div>
				</div>

				<div
					class="absolute bottom-4 right-4 text-indigo-400 group-hover:translate-x-2 transition-transform"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</div>
			</a>
		</div>

		<!-- Footer Note -->
		<div class="text-center mt-12 text-slate-400 animate-fade-in" style="animation-delay: 0.4s">
			<p class="text-sm">Select a mode to continue. You can switch anytime from the navigation.</p>
		</div>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.6s ease-out forwards;
	}
</style>
