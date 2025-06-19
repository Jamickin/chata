<script>
	import { onMount } from 'svelte';
	import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
	import {
		collection,
		onSnapshot,
		query,
		addDoc,
		deleteDoc,
		doc,
		updateDoc,
		serverTimestamp
	} from 'firebase/firestore';

	import { db as firestoreDb, auth as firebaseAuth, tidbitsCollection } from '$lib/firebase';

	const CORRECT_PASSCODE = 's3cretTidbitP@ss';

	let userId = $state(null);
	let isFirebaseReady = $state(false);

	const initialAuthToken =
		typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

	let tidbits = $state([]);
	let selectedTag = $state('all');
	let searchQuery = $state('');

	let showAddModal = $state(false);
	let newTidbit = $state({ title: '', content: '', tags: '' });
	let enteredPasscode = $state('');
	let passcodeError = $state('');

	let showEditModal = $state(false);
	let tidbitToEdit = $state(null);
	let editedTitle = $state('');
	let editedContent = $state('');
	let editedTags = $state('');

	let showDeleteConfirmModal = $state(false);
	let tidbitToDelete = $state(null);

	let showFormMessage = $state(false);
	let formMessage = $state('');
	let formMessageType = $state('error');

	onMount(() => {
		const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
			if (user) {
				userId = user.uid;
			} else {
				try {
					if (initialAuthToken) {
						await signInWithCustomToken(firebaseAuth, initialAuthToken);
					} else {
						await signInAnonymously(firebaseAuth);
					}
					userId = firebaseAuth.currentUser?.uid || crypto.randomUUID();
				} catch (error) {
					console.error('Firebase Auth Error:', error);
					userId = crypto.randomUUID();
				}
			}
			isFirebaseReady = true;
		});

		return () => unsubscribeAuth();
	});

	$effect(() => {
		if (isFirebaseReady && userId && firestoreDb) {
			console.log('Current User ID:', userId);

			const q = query(tidbitsCollection);

			const unsubscribeSnapshot = onSnapshot(
				q,
				(snapshot) => {
					const fetchedTidbits = snapshot.docs.map((doc) => {
						const data = doc.data();
						const tagsArray = Array.isArray(data.tags)
							? data.tags
							: data.tags
								? data.tags
										.split(',')
										.map((tag) => tag.trim())
										.filter((tag) => tag)
								: [];
						return {
							id: doc.id,
							title: data.title,
							content: data.content,
							date:
								data.date ||
								(data.createdAt?.toDate
									? new Date(data.createdAt.toDate()).toLocaleString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})
									: 'Unknown Date'),
							tags: tagsArray,
							createdAt: data.createdAt?.toDate()
						};
					});
					tidbits = fetchedTidbits.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
				},
				(error) => {
					console.error('Error fetching tidbits from Firestore:', error);
					tidbits = [];
				}
			);

			return () => unsubscribeSnapshot();
		}
	});

	let allTags = $derived.by(() => {
		const tags = new Set(['all']);
		tidbits.forEach((tidbit) => {
			tidbit.tags.forEach((tag) => tags.add(tag));
		});
		return Array.from(tags);
	});

	let filteredTidbits = $derived.by(() => {
		const tagMatch = (tidbit) => selectedTag === 'all' || tidbit.tags.includes(selectedTag);
		const searchLower = searchQuery.toLowerCase();
		const searchMatch = (tidbit) =>
			searchQuery === '' ||
			tidbit.content.toLowerCase().includes(searchLower) ||
			tidbit.title.toLowerCase().includes(searchLower);

		return tidbits.filter((tidbit) => tagMatch(tidbit) && searchMatch(tidbit));
	});

	function handleTagSelect(tag) {
		selectedTag = tag;
	}

	// Function to handle keyboard events for closing modals
	function handleModalOverlayKeydown(event) {
		if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
			closeAllModals();
		}
	}

	function openAddModal() {
		showAddModal = true;
		newTidbit = { title: '', content: '', tags: '' };
		enteredPasscode = '';
		passcodeError = '';
		showFormMessage = false;
		formMessage = '';
	}

	function closeAllModals() {
		showAddModal = false;
		showEditModal = false;
		showDeleteConfirmModal = false;
		newTidbit = { title: '', content: '', tags: '' };
		enteredPasscode = '';
		passcodeError = '';
		tidbitToEdit = null;
		tidbitToDelete = null;
		showFormMessage = false;
		formMessage = '';
	}

	async function handleAddTidbit(event) {
		event.preventDefault();

		if (!newTidbit.title || !newTidbit.content) {
			showFormMessage = true;
			formMessageType = 'error';
			formMessage = 'Please fill out both title and content.';
			return;
		}

		if (enteredPasscode !== CORRECT_PASSCODE) {
			passcodeError = 'Incorrect passcode.';
			return;
		} else {
			passcodeError = '';
		}

		if (!firestoreDb || !userId) {
			showFormMessage = true;
			formMessageType = 'error';
			formMessage = 'Firebase is not ready. Please try again later.';
			console.error('Firestore DB instance or User ID not available for adding tidbit.');
			return;
		}

		try {
			await addDoc(tidbitsCollection, {
				title: newTidbit.title,
				content: newTidbit.content,
				date: new Date().toLocaleString('en-US', {
					month: 'long',
					day: 'numeric',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				}),
				tags: newTidbit.tags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag),
				createdAt: serverTimestamp()
			});

			showFormMessage = true;
			formMessageType = 'success';
			formMessage = 'Tidbit added successfully!';
			newTidbit = { title: '', content: '', tags: '' };
			enteredPasscode = '';
			setTimeout(() => {
				closeAllModals();
			}, 1500);
		} catch (e) {
			console.error('Error adding document: ', e);
			showFormMessage = true;
			formMessageType = 'error';
			formMessage = `Failed to add tidbit. Error: ${e.message || 'Unknown error'}`;
		}
	}

	function openEditModal(tidbit) {
		tidbitToEdit = tidbit;
		editedTitle = tidbit.title;
		editedContent = tidbit.content;
		editedTags = tidbit.tags.join(', ');
		showEditModal = true;
	}

	async function handleEditSubmit(event) {
		event.preventDefault();
		try {
			if (!editedTitle || !editedContent) {
				showFormMessage = true;
				formMessageType = 'error';
				formMessage = 'Title and content cannot be empty.';
				return;
			}

			await updateDoc(doc(firestoreDb, tidbitsCollection.path, tidbitToEdit.id), {
				title: editedTitle,
				content: editedContent,
				tags: editedTags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag)
			});
			showFormMessage = true;
			formMessageType = 'success';
			formMessage = 'Tidbit updated successfully!';
			setTimeout(() => {
				closeAllModals();
			}, 1500);
		} catch (e) {
			console.error('Error updating document: ', e);
			showFormMessage = true;
			formMessageType = 'error';
			formMessage = `Failed to update tidbit. Error: ${e.message || 'Unknown error'}`;
		}
	}

	function openDeleteConfirmModal(tidbit) {
		tidbitToDelete = tidbit;
		showDeleteConfirmModal = true;
	}

	async function handleDeleteSubmit(event) {
		event.preventDefault();
		try {
			await deleteDoc(doc(firestoreDb, tidbitsCollection.path, tidbitToDelete.id));
			showFormMessage = true;
			formMessageType = 'success';
			formMessage = 'Tidbit deleted successfully!';
			setTimeout(() => {
				closeAllModals();
			}, 1500);
		} catch (e) {
			console.error('Error deleting document: ', e);
			showFormMessage = true;
			formMessageType = 'error';
			formMessage = `Failed to delete tidbit. Error: ${e.message || 'Unknown error'}`;
		}
	}
</script>

<div class="min-h-screen bg-slate-900 text-slate-300 font-inter antialiased">
	<div class="max-w-4xl mx-auto mb-12 p-4">
		<div class="text-center mb-8 relative">
			<h1
				class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600"
			>
				Tatiana's Tidbits
			</h1>
			<p class="text-lg text-slate-300">Random thoughts, inspirations, and reflections</p>

			<div class="mt-4">
				<button
					onclick={openAddModal}
					class="bg-pink-500 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition-colors shadow-lg"
				>
					+ Add New Tidbit
				</button>
			</div>
			{#if userId}
				<div class="text-sm mt-2 text-slate-500">
					User ID: {userId}
				</div>
			{/if}
		</div>

		<div class="mb-8 bg-slate-800 rounded-lg shadow-sm border border-slate-700 p-4">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1">
					<label for="search" class="block text-sm font-medium text-slate-300 mb-1">
						Search Tidbits
					</label>
					<input
						id="search"
						type="text"
						placeholder="Search by content or title..."
						class="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
						bind:value={searchQuery}
					/>
				</div>

				<div class="md:w-1/3">
					<label for="tag-filter" class="block text-sm font-medium text-slate-300 mb-1">
						Filter by Tag
					</label>
					<div class="relative">
						<select
							id="tag-filter"
							class="w-full px-3 py-2 border border-slate-600 rounded-md appearance-none bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
							bind:value={selectedTag}
						>
							{#each allTags as tag}
								<option value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
							{/each}
						</select>
						<div
							class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400"
						>
							<svg
								class="fill-current h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								><path
									d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
								/></svg
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-4xl mx-auto p-4">
		{#if filteredTidbits.length === 0}
			<p class="text-center text-slate-500 text-lg">
				No tidbits found. Try adjusting your search or filters.
			</p>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each filteredTidbits as tidbit (tidbit.id)}
					<div
						class="bg-slate-800 rounded-lg shadow-sm border border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
					>
						<div class="p-5">
							<div class="flex justify-between items-start mb-3">
								<h3 class="text-xl font-semibold text-white">{tidbit.title}</h3>
								<span class="text-xs text-slate-400">{tidbit.date}</span>
							</div>

							<p class="text-slate-300 mb-4">{tidbit.content}</p>

							<div class="flex flex-wrap gap-2">
								{#if tidbit.tags && tidbit.tags.length > 0}
									{#each tidbit.tags as tag}
										<button
											class="px-2 py-1 text-xs rounded-full bg-pink-900/30 text-pink-300 cursor-pointer hover:bg-pink-900/50"
											onclick={() => handleTagSelect(tag)}
										>
											#{tag}
										</button>
									{/each}
								{:else}
									<span class="text-xs text-slate-500">No tags</span>
								{/if}
							</div>

							<div class="flex justify-end gap-2 mt-4">
								<button
									class="text-xs px-2 py-1 text-indigo-400 hover:underline"
									onclick={() => openEditModal(tidbit)}
								>
									Edit
								</button>
								<button
									class="text-xs px-2 py-1 text-red-400 hover:underline"
									onclick={() => openDeleteConfirmModal(tidbit)}
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if showAddModal}
		<div
			class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
			onclick={closeAllModals}
			onkeydown={handleModalOverlayKeydown}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		>
			<div
				class="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-700"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="p-6">
					<h2 class="text-2xl font-bold mb-4 text-white">Add a New Tidbit</h2>
					<form onsubmit={handleAddTidbit} class="flex flex-col gap-4">
						{#if showFormMessage}
							<div
								class="p-3 rounded-md mb-2 {formMessageType === 'error'
									? 'bg-red-900/30 text-red-400'
									: 'bg-green-900/30 text-green-400'}"
							>
								{formMessage}
							</div>
						{/if}
						<div>
							<label for="title" class="block text-sm font-medium text-slate-300 mb-1">Title</label>
							<input
								id="title"
								type="text"
								bind:value={newTidbit.title}
								class="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
								required
							/>
						</div>
						<div>
							<label for="content" class="block text-sm font-medium text-slate-300 mb-1"
								>Content</label
							>
							<textarea
								id="content"
								rows="4"
								bind:value={newTidbit.content}
								class="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
								required
							></textarea>
						</div>
						<div>
							<label for="tags" class="block text-sm font-medium text-slate-300 mb-1"
								>Tags (comma-separated)</label
							>
							<input
								id="tags"
								type="text"
								bind:value={newTidbit.tags}
								placeholder="e.g. thoughts, svelte, fun"
								class="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
							/>
						</div>
						<div>
							<label for="passcode" class="block text-sm font-medium text-slate-300 mb-1"
								>Passcode</label
							>
							<input
								id="passcode"
								type="password"
								bind:value={enteredPasscode}
								class="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
								required
							/>
							{#if passcodeError}
								<p class="text-red-400 text-sm mt-1">{passcodeError}</p>
							{/if}
						</div>
						<div class="flex justify-end gap-3 mt-2">
							<button
								type="button"
								onclick={closeAllModals}
								class="px-4 py-2 rounded-md text-slate-200 hover:bg-slate-700 transition-colors"
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
			</div>
		</div>
	{/if}

	{#if showEditModal}
		<div
			class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
			onclick={closeAllModals}
			onkeydown={handleModalOverlayKeydown}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		>
			<div
				class="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg border border-slate-700"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="p-6">
					<h2 class="text-2xl font-bold mb-4 text-white">Edit Tidbit</h2>
					<p class="text-slate-300 mb-4">Make changes to your tidbit.</p>
					<form onsubmit={handleEditSubmit} class="flex flex-col gap-4">
						{#if showFormMessage}
							<div
								class="p-3 rounded-md mb-2 {formMessageType === 'error'
									? 'bg-red-900/30 text-red-400'
									: 'bg-green-900/30 text-green-400'}"
							>
								{formMessage}
							</div>
						{/if}
						<div>
							<label for="edited-title" class="block text-sm font-medium text-slate-300 mb-1"
								>Title</label
							>
							<input
								id="edited-title"
								type="text"
								bind:value={editedTitle}
								class="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
								required
							/>
						</div>
						<div>
							<label for="edited-content" class="block text-sm font-medium text-slate-300 mb-1"
								>Content</label
							>
							<textarea
								id="edited-content"
								rows="4"
								bind:value={editedContent}
								class="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
								required
							></textarea>
						</div>
						<div>
							<label for="edited-tags" class="block text-sm font-medium text-slate-300 mb-1"
								>Tags (comma-separated)</label
							>
							<input
								id="edited-tags"
								type="text"
								bind:value={editedTags}
								placeholder="e.g. thoughts, svelte, fun"
								class="w-full px-3 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
							/>
						</div>
						<div class="flex justify-end gap-3 mt-2">
							<button
								type="button"
								onclick={closeAllModals}
								class="px-4 py-2 rounded-md text-slate-200 hover:bg-slate-700 transition-colors"
								>Cancel</button
							>
							<button
								type="submit"
								class="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600 transition-colors"
								>Save Changes</button
							>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}

	{#if showDeleteConfirmModal}
		<div
			class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
			onclick={closeAllModals}
			onkeydown={handleModalOverlayKeydown}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		>
			<div
				class="bg-slate-800 rounded-lg shadow-2xl w-full max-w-sm border border-slate-700"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="p-6">
					<h2 class="text-2xl font-bold mb-4 text-white">Confirm Deletion</h2>
					<p class="text-slate-300 mb-4">
						Are you sure you want to delete this tidbit:
						<span class="font-semibold">{tidbitToDelete?.title}</span>?
					</p>
					<form onsubmit={handleDeleteSubmit}>
						{#if showFormMessage}
							<div
								class="p-3 rounded-md mb-2 {formMessageType === 'error'
									? 'bg-red-900/30 text-red-400'
									: 'bg-green-900/30 text-green-400'}"
							>
								{formMessage}
							</div>
						{/if}
						<div class="flex justify-end gap-3">
							<button
								type="button"
								onclick={closeAllModals}
								class="px-4 py-2 rounded-md text-slate-200 hover:bg-slate-700 transition-colors"
								>Cancel</button
							>
							<button
								type="submit"
								class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
								>Delete</button
							>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>
