<script>
	import { onMount } from 'svelte';

	// --- NEW: Passcode Configuration ---
	// IMPORTANT: Change this to a secret passcode only you and your wife know.
	const CORRECT_PASSCODE = 's3cretTidbitP@ss';

	// --- STATE ---
	let tidbits = $state([]);
	let selectedTag = $state('all');
	let searchQuery = $state('');

	// --- NEW: State for the "Add Tidbit" Modal ---
	let showModal = $state(false);
	let isAuthenticated = $state(false);
	let enteredPasscode = $state('');
	let passcodeError = $state('');
	let newTidbit = $state({ title: '', content: '', tags: '' });

	// --- PERSISTENCE WITH LOCAL STORAGE ---
	// Load tidbits from local storage when the component mounts
	onMount(() => {
		const savedTidbits = localStorage.getItem('tidbits');
		if (savedTidbits) {
			tidbits = JSON.parse(savedTidbits);
		} else {
			// Default tidbit if nothing is saved
			tidbits = [
				{
					id: 1,
					title: 'On Creativity',
					content: 'I puked up the surfer but I still eat the pizza...',
					date: 'April 5, 2025',
					tags: ['thoughts', 'creativity']
				}
			];
		}
	});

	// --- DERIVED STATE & EFFECTS ---
	let allTags = $derived.by(() => {
		const tags = new Set(['all']);
		tidbits.forEach((tidbit) => {
			tidbit.tags.forEach((tag) => tags.add(tag));
		});
		return Array.from(tags);
	});

	let filteredTidbits = $derived.by(() => {
		// Filter by tag
		const tagMatch = (tidbit) => selectedTag === 'all' || tidbit.tags.includes(selectedTag);

		// Filter by search
		const searchLower = searchQuery.toLowerCase();
		const searchMatch = (tidbit) =>
			searchQuery === '' ||
			tidbit.content.toLowerCase().includes(searchLower) ||
			tidbit.title.toLowerCase().includes(searchLower);

		return tidbits
			.filter((tidbit) => tagMatch(tidbit) && searchMatch(tidbit))
			.sort((a, b) => b.id - a.id);
	});

	// --- NEW: Effect to save tidbits to local storage whenever they change ---
	$effect(() => {
		// The initial empty array on startup shouldn't clear storage
		if (tidbits.length > 0) {
			localStorage.setItem('tidbits', JSON.stringify(tidbits));
		}
	});

	// --- FUNCTIONS ---
	function handleTagSelect(tag) {
		selectedTag = tag;
	}

	// --- NEW: Functions to handle the modal and form submission ---
	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		isAuthenticated = false; // Reset authentication on close
		enteredPasscode = '';
		passcodeError = '';
	}

	function handlePasscodeSubmit(event) {
		event.preventDefault(); // <-- Add this line
		if (enteredPasscode === CORRECT_PASSCODE) {
			isAuthenticated = true;
			passcodeError = '';
		} else {
			passcodeError = 'Incorrect passcode. Please try again.';
		}
	}

	function handleAddTidbit(event) {
		event.preventDefault(); // <-- Add this line
		if (!newTidbit.title || !newTidbit.content) {
			alert('Please fill out both title and content.');
			return;
		}

		const newEntry = {
			id: Date.now(), // Use timestamp for a unique ID
			title: newTidbit.title,
			content: newTidbit.content,
			date: new Date().toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			}),
			// Split comma-separated tags into an array, and trim whitespace
			tags: newTidbit.tags
				.split(',')
				.map((tag) => tag.trim())
				.filter((tag) => tag)
		};

		tidbits = [newEntry, ...tidbits];

		// Reset form and close modal
		newTidbit = { title: '', content: '', tags: '' };
		closeModal();
	}
</script>

<div class="max-w-4xl mx-auto mb-12">
	<div class="text-center mb-8 relative">
		<h1
			class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
		>
			Tatiana's Tidbits
		</h1>
		<p class="text-lg text-slate-600 dark:text-slate-300">
			Random thoughts, inspirations, and reflections
		</p>

		<div class="mt-4">
			<button
				onclick={openModal}
				class="bg-pink-500 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-colors shadow-lg"
			>
				+ Add New Tidbit
			</button>
		</div>
	</div>

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
				</div>
			</div>
		</div>
	</div>
</div>

<div class="max-w-4xl mx-auto">
	{#if filteredTidbits.length === 0}{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each filteredTidbits as tidbit (tidbit.id)}
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
								<button
									class="px-2 py-1 text-xs rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 cursor-pointer hover:bg-pink-200"
									onclick={() => handleTagSelect(tag)}
								>
									#{tag}
								</button>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showModal}
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={closeModal}
	>
		<div
			class="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg"
			onclick={(e) => e.stopPropagation()}
		>
			{#if !isAuthenticated}
				<div class="p-6">
					<h2 class="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Enter Passcode</h2>
					<p class="text-slate-600 dark:text-slate-300 mb-4">
						To add a new tidbit, please enter the passcode.
					</p>
					<form onsubmit={handlePasscodeSubmit}>
						<input
							type="password"
							bind:value={enteredPasscode}
							placeholder="Your passcode..."
							class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md mb-2"
							required
						/>
						{#if passcodeError}
							<p class="text-red-500 text-sm mb-4">{passcodeError}</p>
						{/if}
						<div class="flex justify-end gap-3">
							<button
								type="button"
								onclick={closeModal}
								class="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
								>Cancel</button
							>
							<button
								type="submit"
								class="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600">Unlock</button
							>
						</div>
					</form>
				</div>
			{:else}
				<div class="p-6">
					<h2 class="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Add a New Tidbit</h2>
					<form onsubmit={handleAddTidbit} class="flex flex-col gap-4">
						<div>
							<label
								for="title"
								class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
								>Title</label
							>
							<input
								id="title"
								type="text"
								bind:value={newTidbit.title}
								class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
								required
							/>
						</div>
						<div>
							<label
								for="content"
								class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
								>Content</label
							>
							<textarea
								id="content"
								rows="4"
								bind:value={newTidbit.content}
								class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
								required
							></textarea>
						</div>
						<div>
							<label
								for="tags"
								class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
								>Tags (comma-separated)</label
							>
							<input
								id="tags"
								type="text"
								bind:value={newTidbit.tags}
								placeholder="e.g. thoughts, svelte, fun"
								class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
							/>
						</div>
						<div class="flex justify-end gap-3 mt-2">
							<button
								type="button"
								onclick={closeModal}
								class="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
								>Cancel</button
							>
							<button
								type="submit"
								class="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600"
								>Save Tidbit</button
							>
						</div>
					</form>
				</div>
			{/if}
		</div>
	</div>
{/if}
