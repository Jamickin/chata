<script>
	import { db } from '../firebase';
	import {
		collection,
		addDoc,
		Timestamp,
		getDocs,
		deleteDoc,
		doc,
		updateDoc
	} from 'firebase/firestore';

	import { onMount } from 'svelte';
	import Loading from './Loading.svelte';
	import Legend from './Legend.svelte';

	let name = $state('');
	let message = $state('');
	let messages = $state([]);
	let passcode = $state('');
	let loading = $state(false);
	let showMessages = $state(true);
	let showLegend = $state(false);
	let showSubmit = $state(false);
	let editingPost = $state(null);
	let editPostText = $state('');
	let editPostPasscode = $state('');

	const fetchMessages = async () => {
		try {
			loading = true;
			const querySnapshot = await getDocs(collection(db, 'messages'));
			messages = querySnapshot.docs
				.map((doc) => ({
					id: doc.id,
					...doc.data(),
					formattedDate: new Date(doc.data().date.seconds * 1000).toLocaleString()
				}))
				.sort((a, b) => b.date.seconds - a.date.seconds); // Sort by date descending
		} catch (error) {
			console.error('Error fetching messages:', error);
		} finally {
			loading = false;
		}
	};

	onMount(fetchMessages);

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
			showSubmit = false;
			showMessages = true;
		} catch (error) {
			console.error('Error adding document: ', error);
			alert('Failed to post message. Please try again.');
		}
	};

	async function deletePost(postId, postPasscode) {
		const userPasscode = prompt('Enter the passcode to delete this message:');
		if (userPasscode !== postPasscode) {
			alert('Incorrect passcode! Deletion canceled.');
			return;
		}
		try {
			await deleteDoc(doc(db, 'messages', postId));
			messages = messages.filter((msg) => msg.id !== postId);
		} catch (error) {
			console.error('Error deleting post:', error);
			alert('Failed to delete message. Please try again.');
		}
	}

	function startEditing(message) {
		const userPasscode = prompt('Enter the passcode to edit this message:');
		if (userPasscode !== message.passcode) {
			alert('Incorrect passcode! Editing canceled.');
			return;
		}
		editingPost = message;
		editPostText = message.message;
		editPostPasscode = message.passcode;
	}

	async function saveEdit() {
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
	}

	function cancelEdit() {
		editingPost = null;
		editPostText = '';
		editPostPasscode = '';
	}
</script>

<div class="message-container">
	<div class="flex flex-wrap items-center gap-2 mb-4">
		<h3 class="mb-0">Messages</h3>
		<button class="toggle-button w-auto" on:click={() => (showMessages = !showMessages)}>
			{!showMessages ? 'Show Messages' : 'Hide Messages'}
		</button>

		<button class="good-button w-auto ml-auto" on:click={() => (showSubmit = !showSubmit)}>
			{!showSubmit ? 'Post Message' : 'Cancel'}
		</button>
	</div>

	{#if showSubmit}
		<section>
			<h3>Post a New Message</h3>
			<form class="grid grid-cols-1 md:grid-cols-2 gap-4" on:submit={handleSubmit}>
				<div class="form-control md:col-span-1">
					<label for="name" class="block mb-1 font-medium">Your Name</label>
					<input id="name" type="text" placeholder="Your Name" bind:value={name} required />
				</div>

				<div class="form-control md:col-span-1">
					<label for="passcode" class="block mb-1 font-medium"
						>Passcode <span class="text-sm opacity-70">(for editing later)</span></label
					>
					<input id="passcode" type="password" placeholder="Passcode" bind:value={passcode} />
				</div>

				<div class="form-control md:col-span-2">
					<label for="message-text" class="block mb-1 font-medium">Your Message</label>
					<textarea
						id="message-text"
						placeholder="Your Message"
						bind:value={message}
						required
						maxlength="255"
						class="min-h-24"
						on:keydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey && e.ctrlKey) {
								e.preventDefault();
								handleSubmit();
							}
						}}
					></textarea>
					<p class="text-sm mt-1 opacity-70">Press Ctrl+Enter to submit</p>
				</div>

				<div class="form-control md:col-span-2">
					<div class="grid grid-cols-2 gap-2">
						<button type="submit" class="good-button">Post Message</button>
						<button type="button" class="care-button" on:click={() => (showSubmit = false)}
							>Cancel</button
						>
					</div>
				</div>

				<div class="md:col-span-2">
					<div
						class="bg-white dark:bg-slate-700 p-3 rounded-md border border-slate-300 dark:border-slate-600"
					>
						<h4 class="font-medium">Preview:</h4>
						<div class="message-preview mt-2">
							<strong>{name || 'Your Name'}</strong>
							<p>{message || 'Your message will appear here.'}</p>
						</div>
					</div>
				</div>
			</form>
		</section>
	{/if}

	<div class="mt-4 flex items-center gap-2">
		<button class="toggle-button w-auto" on:click={() => (showLegend = !showLegend)}>
			{!showLegend ? 'Show Legend' : 'Hide Legend'}
		</button>
	</div>

	{#if showLegend}
		<div class="mt-2">
			<Legend />
		</div>
	{/if}

	{#if showMessages}
		<section>
			{#if loading}
				<Loading />
			{:else if messages.length === 0}
				<p class="text-center py-4">No messages yet. Be the first to post!</p>
			{:else}
				<div class="space-y-4">
					{#each messages as message (message.id)}
						<div class="message-card">
							{#if editingPost && editingPost.id === message.id}
								<div class="form-control">
									<label for="edit-post" class="block mb-1 font-medium">Edit Message</label>
									<textarea
										id="edit-post"
										bind:value={editPostText}
										placeholder="Edit message"
										class="min-h-24"
									></textarea>
									<div class="button-group mt-2">
										<button class="good-button" on:click={saveEdit}>Save</button>
										<button class="care-button" on:click={cancelEdit}>Cancel</button>
									</div>
								</div>
							{:else}
								<div>
									<div class="flex justify-between items-start mb-2">
										<strong class="text-lg">{message.name}</strong>
										<time class="text-sm opacity-70">{message.formattedDate}</time>
									</div>
									<p class="mb-3">{message.message}</p>
									<div class="flex justify-end gap-2">
										<button class="good-button w-auto" on:click={() => startEditing(message)}>
											Edit
										</button>
										<button
											class="care-button w-auto"
											on:click={() => deletePost(message.id, message.passcode)}
										>
											Delete
											{#if message.passcode}
												<span class="font-mono ml-1">#</span>
											{/if}
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>
