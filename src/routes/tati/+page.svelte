<script>
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import FeatureCard from '$lib/components/FeatureCard.svelte';
	import { onMount } from 'svelte';

	// Tidbits content
	let tidbits = $state([
		{
			id: 1,
			title: 'On Creativity',
			content: 'I puked up the surfer but I still eat the pizza...',
			date: 'April 5, 2025',
			tags: ['thoughts', 'creativity']
		}
	]);

	let selectedTag = $state('all');
	let searchQuery = $state('');
	let filteredTidbits = $state([]);

	// Get all unique tags
	let allTags = $state([]);

	$effect(() => {
		const tags = new Set();
		tags.add('all');

		tidbits.forEach((tidbit) => {
			tidbit.tags.forEach((tag) => tags.add(tag));
		});

		allTags = Array.from(tags);
	});

	// Filter tidbits based on selected tag and search query
	$effect(() => {
		filteredTidbits = tidbits.filter((tidbit) => {
			// Filter by tag
			const tagMatch = selectedTag === 'all' || tidbit.tags.includes(selectedTag);

			// Filter by search
			const searchLower = searchQuery.toLowerCase();
			const contentMatch = tidbit.content.toLowerCase().includes(searchLower);
			const titleMatch = tidbit.title.toLowerCase().includes(searchLower);

			return tagMatch && (contentMatch || titleMatch || searchQuery === '');
		});
	});

	function handleTagSelect(tag) {
		selectedTag = tag;
	}

	// Animated background options
	let colorScheme = $state('pink');
	let backgroundVariant = $state('gradient');

	function changeBackground(variant) {
		backgroundVariant = variant;
	}
</script>

<!-- Animated background -->
<AnimatedBackground variant={backgroundVariant} opacity={0.05} {colorScheme} />

<!-- Header section -->
<div class="max-w-4xl mx-auto mb-12">
	<div class="text-center mb-8">
		<h1
			class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
		>
			Tatiana's Tidbits
		</h1>
		<p class="text-lg text-slate-600 dark:text-slate-300">
			Random thoughts, inspirations, and reflections
		</p>
	</div>

	<!-- Search and filter -->
	<div
		class="mb-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4"
	>
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1">
				<label
					for="search"
					class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
				>
					Search Tidbits
				</label>
				<input
					id="search"
					type="text"
					placeholder="Search by content or title..."
					class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
					bind:value={searchQuery}
				/>
			</div>

			<div class="md:w-1/3">
				<label
					for="tag-filter"
					class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
				>
					Filter by Tag
				</label>
				<div class="relative">
					<select
						id="tag-filter"
						class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md appearance-none"
						bind:value={selectedTag}
					>
						{#each allTags as tag}
							<option value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
						{/each}
					</select>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-300"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					</div>
				</div>
			</div>
		</div>

		<!-- Tags quick selection -->
		<div class="mt-3 flex flex-wrap gap-2">
			{#each allTags as tag}
				<button
					class="px-3 py-1 text-sm rounded-full transition-colors {selectedTag === tag
						? 'bg-pink-500 text-white'
						: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}"
					onclick={() => handleTagSelect(tag)}
				>
					{tag.charAt(0).toUpperCase() + tag.slice(1)}
				</button>
			{/each}
		</div>
	</div>

	<!-- Background style toggle -->
	<div class="flex justify-center gap-3 mb-8">
		<button
			class="px-3 py-1 text-sm rounded-md transition-colors {backgroundVariant === 'gradient'
				? 'bg-pink-500 text-white'
				: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}"
			onclick={() => changeBackground('gradient')}
		>
			Gradient
		</button>
		<button
			class="px-3 py-1 text-sm rounded-md transition-colors {backgroundVariant === 'particles'
				? 'bg-pink-500 text-white'
				: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}"
			onclick={() => changeBackground('particles')}
		>
			Particles
		</button>
		<button
			class="px-3 py-1 text-sm rounded-md transition-colors {backgroundVariant === 'waves'
				? 'bg-pink-500 text-white'
				: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}"
			onclick={() => changeBackground('waves')}
		>
			Waves
		</button>
	</div>
</div>

<!-- Tidbits content -->
<div class="max-w-4xl mx-auto">
	{#if filteredTidbits.length === 0}
		<div
			class="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mx-auto h-12 w-12 text-slate-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 13a1 1 0 100-2 1 1 0 000 2z"
				/>
			</svg>
			<h3 class="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">No tidbits found</h3>
			<p class="mt-2 text-slate-500 dark:text-slate-400">
				Try changing your search or filter settings
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each filteredTidbits as tidbit}
				<div
					class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
				>
					<div class="p-5">
						<div class="flex justify-between items-start mb-3">
							<h3 class="text-xl font-semibold text-slate-800 dark:text-white">{tidbit.title}</h3>
							<span class="text-xs text-slate-500 dark:text-slate-400">{tidbit.date}</span>
						</div>

						<p class="text-slate-600 dark:text-slate-300 mb-4">{tidbit.content}</p>

						<div class="flex flex-wrap gap-2">
							{#each tidbit.tags as tag}
								<span
									class="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
									onclick={() => handleTagSelect(tag)}
								>
									#{tag}
								</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Coming soon section -->
	<div
		class="mt-12 text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
	>
		<h2 class="text-2xl font-semibold text-slate-800 dark:text-white mb-4">
			More Tidbits Coming Soon
		</h2>
		<p class="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
			Tatiana is brewing up more thoughts and insights to share with the world. Check back regularly
			for new content!
		</p>
	</div>
</div>
