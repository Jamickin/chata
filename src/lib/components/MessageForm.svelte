<script>
	import { db } from '../firebase';
	import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
	import { onMount } from 'svelte';
	import Loading from './Loading.svelte';

	let name = $state('');
	let message = $state('');
	let messages = $state([]);
	let passcode = $state('');
	let isMobile = $state(false);
	let loading = $state(false);

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
</script>

<h3>Messages:</h3>
<section>
	{#if !loading}
		{#each messages as message (message.id)}
			<div>
				<strong>{message.name} said:</strong>
				<p>{message.message}</p>
				<time>{new Date(message.date.seconds * 1000).toLocaleString()}</time>
				<button class="care-button" onclick={() => deletePost(message.id, message.passcode)}>
					{#if message.passcode !== ''}
						Delete <span>#</span>
					{:else}
						Delete
					{/if}
				</button>
			</div>
		{/each}
	{:else}<Loading />{/if}
</section>

<h3>Legend:</h3>
<section>
	<ul><li><span>#</span>: Post is Passcode Blocked</li></ul>
</section>

<h3>Submit a Message:</h3>
<section>
	<form onsubmit={handleSubmit}>
		<input type="text" placeholder="Your Name" bind:value={name} required />
		<textarea
			placeholder="Your Message"
			bind:value={message}
			required
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					handleSubmit(e);
				}
			}}
		></textarea>
		<input type="text" placeholder="Passcode" bind:value={passcode} />
		<button type="submit">Post</button>
	</form>
	<div>
		<h3>Preview:</h3>
		<div if={message}>
			<strong>{name || 'Your Name'} said:</strong>
			<p>{message || 'Your message will appear here.'}</p>
		</div>
	</div>
</section>

<style>
	span {
		@apply opacity-55;
	}
</style>
