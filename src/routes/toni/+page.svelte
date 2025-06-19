<script>
	import { onMount } from 'svelte';
	import AnimatedBackground from '$lib/components/AnimatedBackground.svelte';
	import { db } from '$lib/firebase';
	import {
		collection,
		addDoc,
		Timestamp,
		getDocs,
		deleteDoc,
		doc,
		updateDoc,
		query,
		orderBy
	} from 'firebase/firestore';

	// State variables
	let name = $state('');
	let message = $state('');
	let messages = $state([]);
	let passcode = $state('');
	let loading = $state(true);
	let showSubmitForm = $state(false);
	let editingPost = $state(null);
	let editPostText = $state('');
	let editPostPasscode = $state('');
	let confirmDeleteId = $state(null);

	// Animation and filtering states
	let selectedFilter = $state('all');
	let searchQuery = $state('');
	let animationComplete = $state(false);

	// Fetch messages from Firestore
	const fetchMessages = async () => {
		try {
			loading = true;
			const messagesQuery = query(collection(db, 'messages'), orderBy('date', 'desc'));
			const querySnapshot = await getDocs(messagesQuery);

			messages = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				formattedDate: new Date(doc.data().date.seconds * 1000).toLocaleString()
			}));
		} catch (error) {
			console.error('Error fetching messages:', error);
		} finally {
			loading = false;
		}
	};

	// Submit new message
	const handleSubmit = async (event) => {
		if (event) event.preventDefault();
		if (!name.trim() || !message.trim()) {
			alert('Name and message are required!');
			return;
		}

		try {
			await addDoc(collection(db, 'messages'), {
				name,
				message,
				passcode,
				date: Timestamp.now()
			});

			message = '';
			fetchMessages();
			showSubmitForm = false;
		} catch (error) {
			console.error('Error adding document:', error);
			alert('Failed to post message. Please try again.');
		}
	};

	// Delete confirmation
	const confirmDelete = (id) => {
		confirmDeleteId = id;
	};

	// Cancel delete
	const cancelDelete = () => {
		confirmDeleteId = null;
	};

	// Delete message
	const deletePost = async (postId, postPasscode) => {
		const userPasscode = prompt('Enter the passcode to delete this message:');
		if (userPasscode !== postPasscode) {
			alert('Incorrect passcode! Deletion canceled.');
			return;
		}

		try {
			await deleteDoc(doc(db, 'messages', postId));
			messages = messages.filter((msg) => msg.id !== postId);
			confirmDeleteId = null;
		} catch (error) {
			console.error('Error deleting message:', error);
			alert('Failed to delete message. Please try again.');
		}
	};

	// Start editing a message
	const startEditing = (message) => {
		const userPasscode = prompt('Enter the passcode to edit this message:');
		if (userPasscode !== message.passcode) {
			alert('Incorrect passcode! Editing canceled.');
			return;
		}

		editingPost = message;
		editPostText = message.message;
		editPostPasscode = message.passcode;
	};

	// Save edits
	const saveEdit = async () => {
		if (!editPostText.trim()) {
			alert('Message text cannot be empty!');
			return;
		}

		try {
			await updateDoc(doc(db, 'messages', editingPost.id), {
				message: editPostText
			});

			messages = messages.map((m) =>
				m.id === editingPost.id ? { ...m, message: editPostText } : m
			);

			editingPost = null;
			editPostText = '';
			editPostPasscode = '';
		} catch (error) {
			console.error('Error editing message:', error);
			alert('Failed to update message. Please try again.');
		}
	};

	// Cancel editing
	const cancelEdit = () => {
		editingPost = null;
		editPostText = '';
		editPostPasscode = '';
	};

	// Filter messages
	$effect(() => {
		// Animation is complete so we can safely show messages
		if (!loading && messages.length > 0) {
			setTimeout(() => {
				animationComplete = true;
			}, 500);
		}
	});

	// Get filtered messages
	let filteredMessages = $state([]);

	$effect(() => {
		const searchLower = searchQuery.toLowerCase();

		filteredMessages = messages.filter((msg) => {
			const nameMatch = msg.name.toLowerCase().includes(searchLower);
			const messageMatch = msg.message.toLowerCase().includes(searchLower);
			const dateMatch = msg.formattedDate.toLowerCase().includes(searchLower);

			if (selectedFilter === 'all') {
				return nameMatch || messageMatch || dateMatch || searchQuery === '';
			} else if (selectedFilter === 'protected') {
				return (
					(nameMatch || messageMatch || dateMatch || searchQuery === '') &&
					msg.passcode &&
					msg.passcode.trim() !== ''
				);
			} else if (selectedFilter === 'public') {
				return (
					(nameMatch || messageMatch || dateMatch || searchQuery === '') &&
					(!msg.passcode || msg.passcode.trim() === '')
				);
			}

			return false;
		});
	});

	// Get unique authors
	let authors = $state([]);

	$effect(() => {
		const authorSet = new Set();
		messages.forEach((msg) => authorSet.add(msg.name));
		authors = Array.from(authorSet);
	});

	// Fetch messages on mount
	onMount(fetchMessages);
</script>

<!-- Animated background -->
<AnimatedBackground variant="waves" opacity={0.07} colorScheme="purple" />

<!-- Page Header -->
<div class="max-w-4xl mx-auto mb-8">
	<div class="text-center mb-8">
		<h1
			class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
		>
			Toni's Timeline
		</h1>
		<p class="text-lg text-slate-600 dark:text-slate-300">
			Share your thoughts and connect with the community
		</p>
	</div>

	<!-- Action Buttons -->
	<div class="flex justify-center gap-4 mb-8">
		<button
			class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
			onclick={() => (showSubmitForm = !showSubmitForm)}
		>
			{showSubmitForm ? 'Cancel Post' : 'Post a Message'}
		</button>

		<button
			class="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-all"
			onclick={fetchMessages}
		>
			Refresh Timeline
		</button>
	</div>
</div>

<!-- Submit Form -->
{#if showSubmitForm}
	<div
		class="max-w-2xl mx-auto mb-12 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-slideDown"
	>
		<div class="bg-gradient-to-r from-indigo-500 to-purple-600 py-3 px-4">
			<h2 class="text-xl font-semibold text-white">Share Your Message</h2>
		</div>

		<form class="p-6" onsubmit={handleSubmit}>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				<div>
					<label for="name" class="block text-sm font-medium text-slate-300 mb-1">
						Your Name*
					</label>
					<input
						id="name"
						type="text"
						placeholder="Enter your name"
						class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
						bind:value={name}
						required
					/>
				</div>

				<div>
					<label for="passcode" class="block text-sm font-medium text-slate-300 mb-1">
						Passcode <span class="text-xs text-slate-500">(for editing/deleting later)</span>
					</label>
					<input
						id="passcode"
						type="password"
						placeholder="Optional passcode"
						class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
						bind:value={passcode}
					/>
				</div>
			</div>

			<div class="mb-4">
				<label for="message" class="block text-sm font-medium text-slate-300 mb-1">
					Your Message*
				</label>
				<textarea
					id="message"
					rows="4"
					placeholder="What's on your mind?"
					class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
					bind:value={message}
					required
				></textarea>
				<p class="text-xs text-slate-500 mt-1 text-right">{message.length}/255 characters</p>
			</div>

			<div class="flex justify-between items-center">
				<div>
					<p class="text-xs text-slate-500">
						<span class="font-bold">Note:</span> Messages with passcodes can be edited or deleted later
					</p>
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
						onclick={() => (showSubmitForm = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
					>
						Post Message
					</button>
				</div>
			</div>
		</form>

		<!-- Preview Box -->
		{#if name || message}
			<div
				class="p-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700"
			>
				<h3 class="text-sm font-medium text-slate-300 mb-2">Preview:</h3>
				<div
					class="bg-white dark:bg-slate-800 p-4 rounded-md border border-slate-200 dark:border-slate-700"
				>
					<div class="flex justify-between items-start mb-2">
						<span class="font-medium">{name || 'Your Name'}</span>
						<span class="text-xs text-slate-500">Just now</span>
					</div>
					<p class="text-slate-600 dark:text-slate-300">
						{message || 'Your message will appear here.'}
					</p>
					{#if passcode}
						<div class="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 mr-1"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
									clip-rule="evenodd"
								/>
							</svg>
							Protected message
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<!-- Message Filtering -->
<div class="max-w-4xl mx-auto mb-8">
	<div
		class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4"
	>
		<div class="flex flex-col md:flex-row gap-4">
			<div class="flex-1">
				<label for="search" class="block text-sm font-medium text-slate-300 mb-1">
					Search Messages
				</label>
				<input
					id="search"
					type="text"
					placeholder="Search by name, content or date..."
					class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
					bind:value={searchQuery}
				/>
			</div>

			<div class="md:w-1/3">
				<label for="filter" class="block text-sm font-medium text-slate-300 mb-1">
					Filter Messages
				</label>
				<div class="relative">
					<select
						id="filter"
						class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md appearance-none"
						bind:value={selectedFilter}
					>
						<option value="all">All Messages</option>
						<option value="protected">Protected Only</option>
						<option value="public">Public Only</option>
					</select>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-300"
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

		<!-- Quick filters -->
		{#if authors.length > 0}
			<div class="mt-3">
				<h3 class="block text-sm font-medium text-slate-300 mb-1">Filter by Author</h3>
				<div class="flex flex-wrap gap-2">
					<button
						class="px-3 py-1 text-sm rounded-full transition-colors bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/30"
						onclick={() => (searchQuery = '')}
					>
						All
					</button>

					{#each authors.slice(0, 5) as author}
						<button
							class="px-3 py-1 text-sm rounded-full transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
							onclick={() => (searchQuery = author)}
						>
							{author}
						</button>
					{/each}

					{#if authors.length > 5}
						<span class="px-3 py-1 text-sm text-slate-500">+{authors.length - 5} more</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Messages Timeline -->
<div class="max-w-3xl mx-auto">
	{#if loading}
		<div class="flex justify-center items-center py-12">
			<div class="loader">
				<div class="loader-inner"></div>
			</div>
			<span class="ml-3 text-slate-600 dark:text-slate-300">Loading messages...</span>
		</div>
	{:else if filteredMessages.length === 0}
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
					d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
				/>
			</svg>
			<h3 class="mt-4 text-lg font-medium text-slate-300">No messages found</h3>
			<p class="mt-2 text-slate-500 dark:text-slate-400">
				Be the first to post or try different search criteria
			</p>
		</div>
	{:else}
		<!-- Timeline with messages -->
		<div
			class="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-pink-300 before:content-['']"
		>
			{#each filteredMessages as msg, index}
				<div
					class="relative pl-6 pb-8 {index === 0 && 'pt-2'} {animationComplete
						? `animate-fadeSlideIn animation-delay-${index % 5}`
						: 'opacity-0'}"
				>
					<!-- Timeline dot -->
					<div
						class="absolute left-0 flex items-center justify-center w-10 h-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md"
					>
						<span class="text-xs font-bold text-white">{msg.name.charAt(0).toUpperCase()}</span>
					</div>

					<!-- Message card -->
					<div
						class="relative bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
					>
						{#if msg.passcode && msg.passcode.trim() !== ''}
							<div
								class="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center w-5 h-5 bg-indigo-500 rounded-full shadow"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-3 w-3 text-white"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						{/if}

						<!-- Edit mode -->
						{#if editingPost && editingPost.id === msg.id}
							<div class="mb-3">
								<label for="edit-message" class="block text-sm font-medium text-slate-300 mb-1">
									Edit Message
								</label>
								<textarea
									id="edit-message"
									rows="3"
									class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md"
									bind:value={editPostText}
								></textarea>
							</div>

							<div class="flex justify-end gap-2">
								<button
									class="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
									onclick={cancelEdit}
								>
									Cancel
								</button>
								<button
									class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
									onclick={saveEdit}
								>
									Save Changes
								</button>
							</div>
						{:else}
							<!-- Normal mode -->
							<div class="flex justify-between items-start mb-1">
								<h3 class="font-medium text-slate-900 dark:text-white">{msg.name}</h3>
								<span class="text-xs text-slate-500 dark:text-slate-400">{msg.formattedDate}</span>
							</div>

							<p class="text-slate-600 dark:text-slate-300 mb-3">{msg.message}</p>

							<!-- Actions -->
							{#if msg.passcode && msg.passcode.trim() !== ''}
								<div class="flex justify-end gap-2">
									<button
										class="text-xs px-2 py-1 text-indigo-600 dark:text-indigo-400 hover:underline"
										onclick={() => startEditing(msg)}
									>
										Edit
									</button>

									{#if confirmDeleteId === msg.id}
										<div class="flex gap-1 items-center">
											<span class="text-xs text-slate-500">Confirm?</span>
											<button
												class="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:underline"
												onclick={() => deletePost(msg.id, msg.passcode)}
											>
												Yes
											</button>
											<button
												class="text-xs px-2 py-1 text-slate-600 dark:text-slate-400 hover:underline"
												onclick={cancelDelete}
											>
												No
											</button>
										</div>
									{:else}
										<button
											class="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:underline"
											onclick={() => confirmDelete(msg.id)}
										>
											Delete
										</button>
									{/if}
								</div>
							{/if}
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Loading animation */
	.loader {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 3px solid rgba(99, 102, 241, 0.2);
		border-top-color: rgba(99, 102, 241, 1);
		animation: loader-spin 1s linear infinite;
	}

	@keyframes loader-spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Animations */
	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fadeSlideIn {
		animation: fadeSlideIn 0.5s ease-out forwards;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slideDown {
		animation: slideDown 0.3s ease-out forwards;
	}

	/* Animation delays */
	.animation-delay-0 {
		animation-delay: 0s;
	}
	.animation-delay-1 {
		animation-delay: 0.1s;
	}
	.animation-delay-2 {
		animation-delay: 0.2s;
	}
	.animation-delay-3 {
		animation-delay: 0.3s;
	}
	.animation-delay-4 {
		animation-delay: 0.4s;
	}
</style>
