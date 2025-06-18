<script>
	import { onMount } from 'svelte';
	import Todo from '$lib/components/Todo.svelte';
	import CurrencyConverter from '$lib/components/CurrencyConverter.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import FeatureCard from '$lib/components/FeatureCard.svelte';

	// Active component state
	let activeComponent = $state(null);

	// Animation state
	let animationComplete = $state(false);

	// Project data
	const projects = [
		{
			id: 'todo',
			title: 'Task Manager',
			description: 'Keep track of your tasks with password protection for security.',
			icon: 'todo',
			color: 'green'
		},
		{
			id: 'converter',
			title: 'Currency Converter',
			description: 'Convert between different currencies using real-time exchange rates.',
			icon: 'currency',
			color: 'blue'
		},
		{
			id: 'legend',
			title: 'Legend',
			description: 'Learn about the symbols and features used throughout the application.',
			icon: 'settings',
			color: 'purple'
		}
	];

	// Toggle active component
	function toggleComponent(id) {
		if (activeComponent === id) {
			activeComponent = null;
		} else {
			activeComponent = id;
			// Scroll to component after a brief delay
			setTimeout(() => {
				const element = document.getElementById(`${id}-component`);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}, 100);
		}
	}

	// Initialize animations
	onMount(() => {
		setTimeout(() => {
			animationComplete = true;
		}, 300);
	});
</script>

<!-- Animated background -->
<AnimatedBackground variant="grid" opacity={0.05} colorScheme="blue" />

<!-- Page Header -->
<div class="max-w-5xl mx-auto mb-12">
	<div class="text-center mb-8">
		<h1
			class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
		>
			Miscellaneous Projects
		</h1>
		<p class="text-lg text-slate-600 dark:text-slate-300">
			A collection of useful tools and utilities
		</p>
	</div>
</div>

<!-- Project Cards -->
<div class="max-w-5xl mx-auto mb-16">
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		{#each projects as project, index}
			<div
				class="transform transition-all duration-500 {animationComplete
					? `opacity-100 translate-y-0`
					: `opacity-0 translate-y-8`}"
				style="transition-delay: {index * 150}ms"
			>
				<FeatureCard
					title={project.title}
					description={project.description}
					icon={project.icon}
					color={project.color}
				>
					<div class="mt-4">
						<button
							class="w-full px-4 py-2 bg-gradient-to-r {project.color === 'green'
								? 'from-green-500 to-emerald-600'
								: project.color === 'blue'
									? 'from-blue-500 to-cyan-600'
									: 'from-indigo-500 to-purple-600'} text-white rounded-md shadow-sm hover:shadow-md transition-all"
							onclick={() => toggleComponent(project.id)}
						>
							{activeComponent === project.id ? 'Hide' : 'Show'}
							{project.title}
						</button>
					</div>
				</FeatureCard>
			</div>
		{/each}
	</div>
</div>

<!-- Active Component Section -->
{#if activeComponent}
	<div class="max-w-5xl mx-auto mb-16 animate-fadeIn">
		<div
			id="{activeComponent}-component"
			class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
		>
			<div
				class="bg-gradient-to-r {activeComponent === 'todo'
					? 'from-green-500 to-emerald-600'
					: activeComponent === 'converter'
						? 'from-blue-500 to-cyan-600'
						: 'from-indigo-500 to-purple-600'} py-3 px-6"
			>
				<div class="flex justify-between items-center">
					<h2 class="text-xl font-semibold text-white">
						{projects.find((p) => p.id === activeComponent)?.title}
					</h2>
					<button
						class="p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
						onclick={() => toggleComponent(activeComponent)}
						aria-label="Close"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>

			<div class="p-6">
				{#if activeComponent === 'todo'}
					<Todo />
				{:else if activeComponent === 'converter'}
					<CurrencyConverter />
				{:else if activeComponent === 'legend'}
					<div>
						<Legend />

						<div
							class="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800"
						>
							<h3 class="text-xl font-medium text-blue-800 dark:text-blue-300 mb-3">
								Additional Information
							</h3>
							<div class="text-blue-700 dark:text-blue-300 space-y-2">
								<p>
									The legend explains the symbols and notations used throughout the application:
								</p>
								<ul class="list-disc pl-5 space-y-2">
									<li>
										<span class="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">#</span> - Indicates
										that an item is password-protected. You'll need the correct passcode to edit or delete
										it.
									</li>
									<li>
										<span class="font-semibold">Task Manager</span> - All tasks can be password-protected
										for enhanced security.
									</li>
									<li>
										<span class="font-semibold">Message Board</span> - Messages can optionally be protected
										with a passcode.
									</li>
								</ul>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Tips and Tricks -->
<div class="max-w-5xl mx-auto mb-16">
	<div
		class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
	>
		<div class="p-6">
			<h2 class="text-2xl font-semibold text-slate-800 dark:text-white mb-4">Tips and Tricks</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div
					class="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-md border border-slate-200 dark:border-slate-700"
				>
					<h3 class="text-lg font-medium text-slate-800 dark:text-white mb-2">Task Manager</h3>
					<ul class="space-y-2 text-slate-600 dark:text-slate-300">
						<li class="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span
								>Use passcodes to protect sensitive tasks. Only users with the passcode can modify
								or delete them.</span
							>
						</li>
						<li class="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span
								>Click the checkbox to mark tasks as complete, and they'll be visually indicated as
								done.</span
							>
						</li>
					</ul>
				</div>

				<div
					class="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-md border border-slate-200 dark:border-slate-700"
				>
					<h3 class="text-lg font-medium text-slate-800 dark:text-white mb-2">
						Currency Converter
					</h3>
					<ul class="space-y-2 text-slate-600 dark:text-slate-300">
						<li class="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>Click "Refresh Rates" to get the latest exchange rates from the API.</span>
						</li>
						<li class="flex items-start">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span
								>Exchange rates are stored locally for faster access, with timestamps to show when
								they were last updated.</span
							>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Coming Soon Section -->
<div class="max-w-5xl mx-auto mb-16">
	<div
		class="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg"
	>
		<div class="text-center">
			<h2 class="text-2xl font-bold mb-4">More Tools Coming Soon</h2>
			<p class="max-w-2xl mx-auto mb-6">
				We're continuously working on adding new tools and utilities to make your experience even
				better. Stay tuned for exciting updates!
			</p>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
				<div class="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
					<h3 class="font-semibold mb-2">Weather Dashboard</h3>
					<p class="text-white/80 text-sm">
						Get real-time weather updates and forecasts for your location.
					</p>
				</div>
				<div class="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
					<h3 class="font-semibold mb-2">Note Taking App</h3>
					<p class="text-white/80 text-sm">
						Create, edit, and organize your notes with rich text formatting.
					</p>
				</div>
				<div class="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
					<h3 class="font-semibold mb-2">Calculator</h3>
					<p class="text-white/80 text-sm">
						Advanced calculator with unit conversion and scientific functions.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Animations */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out forwards;
	}
</style>
