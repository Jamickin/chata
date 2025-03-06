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
	let isMobile = $state(false);
	let loading = $state(false);
	let showMessages = $state(false);
	let showLegend = $state(false);
	let showSubmit = $state(false);
	let editingPost = $state(null);
	let editPostText = $state('');
	let editPostPasscode = $state('');

	$effect(() => {
		if (typeof window !== 'undefined') {
			isMobile = window.innerWidth <= 768;
			const updateWidth = () => (isMobile = window.innerWidth <= 768);
			window.addEventListener('resize', updateWidth);
			return () => window.removeEventListener('resize', updateWidth);
		}
	});

	const fetchMessages = async () => {
		try {
			loading = true;
			const querySnapshot = await getDocs(collection(db, 'messages'));
			messages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		} catch (error) {
			console.error('Error fetching messages:', error);
		} finally {
			loading = false;
		}
	};

	onMount(fetchMessages);

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			await addDoc(collection(db, 'messages'), {
				name,
				message,
				passcode,
				date: Timestamp.now()
			});
			name = '';
			message = '';
			passcode = '';
			fetchMessages();
		} catch (error) {
			console.error('Error adding document: ', error);
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
			console.log('Post deleted successfully');
		} catch (error) {
			console.error('Error deleting post:', error);
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
		}
	}

	function cancelEdit() {
		editingPost = null;
		editPostText = '';
		editPostPasscode = '';
	}
</script>

<h3>Messages:</h3>
<button
	class="toggle-button"
	onclick={() => {
		showMessages = !showMessages;
	}}>{!showMessages ? 'Show Messages' : 'Hide Messages'}</button
>
{#if showMessages}
	<section>
		{#if !loading}
			{#each messages as message (message.id)}
				{#if editingPost && editingPost.id === message.id}<div>
						<label for="edit post">Edit Post</label>
						<input type="text" bind:value={editPostText} placeholder="Edit post" />
						<button class="good-button" onclick={saveEdit}> Save </button>
						<button class="care-button" onclick={cancelEdit}> Cancel </button>
					</div>{:else}
					<div class="flex flex-col my-4">
						<strong>{message.name} said:</strong>
						<p>{message.message}</p>
						<time class="opacity-55">{new Date(message.date.seconds * 1000).toLocaleString()}</time>
						<button class="care-button" onclick={() => deletePost(message.id, message.passcode)}>
							{#if message.passcode !== ''}
								Delete <span>#</span>
							{:else}
								Delete
							{/if}
						</button>
						<button class="good-button" onclick={() => startEditing(message)}>Edit</button>
					</div>
				{/if}
			{/each}
		{:else}<Loading />{/if}
	</section>
{/if}

<h3>Legend:</h3>
<button
	class="toggle-button"
	onclick={() => {
		showLegend = !showLegend;
	}}>{!showLegend ? 'Show Legend' : 'Hide Legend'}</button
>
{#if showLegend}
	<Legend />
{/if}

<h3>Submit a Message:</h3>
<button
	class="toggle-button"
	onclick={() => {
		showSubmit = !showSubmit;
	}}>{!showSubmit ? 'Show Submit' : 'Hide Submit'}</button
>
{#if showSubmit}
	<section class="flex {!isMobile ? '' : 'flex-col'} ">
		<form class="flex flex-col gap-2 {!isMobile ? 'w-1/2' : ''}" onsubmit={handleSubmit}>
			<div class="flex flex-col gap-2">
				<input type="text" placeholder="Your Name" bind:value={name} required />
				<input type="text" placeholder="Passcode" bind:value={passcode} />
			</div>
			<textarea
				class="min-h-8"
				placeholder="Your Message"
				bind:value={message}
				required
				maxlength="255"
				onkeydown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleSubmit(e);
					}
				}}
			></textarea>
			<button type="submit">Post</button>
		</form>
		<div class="{!isMobile ? 'w-1/2' : ''} text-center">
			<h3>Preview:</h3>
			<div class="w-full" if={message}>
				<strong>{name || 'Your Name'} said:</strong>
				<p class="w-full">{message || 'Your message will appear here.'}</p>
			</div>
		</div>
	</section>
{/if}

<style>
	span {
		@apply opacity-55;
	}
</style>
