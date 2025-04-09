<script>
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase';
	import { collection, getDocs } from 'firebase/firestore';

	// Stats we'll fetch from Firebase
	let stats = $state([
		{ label: 'Messages', value: 0, icon: 'messages', collection: 'messages' },
		{ label: 'Tasks', value: 0, icon: 'tasks', collection: 'todos' },
		{
			label: 'Users',
			value: 0,
			icon: 'users',
			collection: 'messages',
			count: 'unique',
			field: 'name'
		},
		{ label: 'Pages', value: 4, icon: 'pages' } // This is a static value - we know there are 4 pages
	]);

	let animatedValues = $state(stats.map(() => 0));
	let observer;
	let containerRef;
	let hasAnimated = $state(false);
	let loading = $state(true);

	// Icons mapping
	const icons = {
		users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
		messages: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
		tasks: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="8" x="3" y="3" rx="1"></rect><rect width="8" height="8" x="13" y="3" rx="1"></rect><rect width="8" height="8" x="3" y="13" rx="1"></rect><rect width="8" height="8" x="13" y="13" rx="1"></rect></svg>`,
		pages: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>`
	};

	// Fetch real collection counts from Firebase
	async function fetchCollectionCounts() {
		loading = true;

		try {
			// Create a copy of the stats array
			const updatedStats = [...stats];

			// Process each stat item
			for (let i = 0; i < updatedStats.length; i++) {
				const stat = updatedStats[i];

				// If this stat has a collection, fetch its count
				if (stat.collection) {
					const snapshot = await getDocs(collection(db, stat.collection));

					if (stat.count === 'unique' && stat.field) {
						// Count unique values in the field (e.g., unique users)
						const uniqueValues = new Set();
						snapshot.docs.forEach((doc) => {
							const data = doc.data();
							if (data[stat.field]) {
								uniqueValues.add(data[stat.field]);
							}
						});
						stat.value = uniqueValues.size;
					} else {
						// Just count the documents
						stat.value = snapshot.size;
					}
				}
				// Otherwise keep the static value
			}

			// Update the stats array
			stats = updatedStats;
		} catch (error) {
			console.error('Error fetching collection counts:', error);
		} finally {
			loading = false;
		}
	}

	function animateValue(index, start, end, duration) {
		const startTime = performance.now();
		const updateValue = (timestamp) => {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			// Ease out cubic function for smoother end of animation
			const easeProgress = 1 - Math.pow(1 - progress, 3);
			animatedValues[index] = Math.floor(start + easeProgress * (end - start));

			if (progress < 1) {
				requestAnimationFrame(updateValue);
			}
		};

		requestAnimationFrame(updateValue);
	}

	function startAnimation() {
		if (hasAnimated) return;

		stats.forEach((stat, index) => {
			// Stagger the animations
			setTimeout(() => {
				animateValue(index, 0, stat.value, 2000);
			}, index * 200);
		});

		hasAnimated = true;
	}

	onMount(() => {
		// Fetch the actual counts first
		fetchCollectionCounts().then(() => {
			// Set up the intersection observer for animation
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							startAnimation();
							observer.disconnect();
						}
					});
				},
				{ threshold: 0.1 }
			);

			if (containerRef) {
				observer.observe(containerRef);
			}
		});

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});

	// Format large numbers with commas
	function formatNumber(num) {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
</script>

<div
	bind:this={containerRef}
	class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
>
	<h3 class="text-xl font-semibold text-slate-800 dark:text-white mb-6 text-center">
		<slot name="title">Community Stats</slot>
	</h3>

	{#if loading}
		<div class="flex justify-center items-center py-8">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
			<span class="ml-3">Loading stats...</span>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each stats as stat, i}
				<div
					class="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 text-center relative overflow-hidden group"
				>
					<!-- Decorative background circle -->
					<div
						class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-600/30 group-hover:scale-110 transition-transform duration-500"
					></div>

					<!-- Icon -->
					<div
						class="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 mb-3 mx-auto group-hover:scale-110 transition-transform duration-300"
					>
						{@html icons[stat.icon] || ''}
					</div>

					<!-- Value with animation -->
					<h4 class="text-2xl font-bold text-slate-800 dark:text-white mb-1 relative z-10">
						{formatNumber(animatedValues[i])}
					</h4>

					<!-- Label -->
					<p class="text-slate-600 dark:text-slate-300 font-medium relative z-10">{stat.label}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
