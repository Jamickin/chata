<script>
	import { db } from '../firebase';
	import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
	import { onMount } from 'svelte';

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

<h1>Toni's Timeline</h1>

<section class="grid {!isMobile ? 'grid-cols-2' : ''} gap-4">
	{#if !loading}
		{#each messages as message (message.id)}
			<div class="p-4 rounded-md shadow-md bg-white dark:bg-slate-700 flex items-center flex-col">
				<strong class="text-orange-400">{message.name} said:</strong>
				<p class="mt-2">{message.message}</p>
				<time class="text-sm text-gray-500"
					>{new Date(message.date.seconds * 1000).toLocaleString()}</time
				>
				<button
					class="mt-2 bg-red-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-red-600"
					onclick={() => deletePost(message.id, message.passcode)}
				>
					{#if message.passcode !== ''}
						Delete <span class="opacity-35">#</span>
					{:else}
						Delete
					{/if}
				</button>
			</div>
		{/each}
	{:else}Loading{/if}
</section>

<section class="dark:bg-slate-700 rounded-2xl px-4 py-8">
	<h3>Legend:</h3>
	<ul><li><span class="opacity-35">#</span>: Post is Passcode Blocked</li></ul>
</section>

<section class="flex {isMobile ? 'flex-col' : ''} justify-around">
	<form
		class="{!isMobile ? 'w-1/2' : 'w-full'} flex flex-col p-4 space-y-4"
		onsubmit={handleSubmit}
	>
		<input
			class="p-2 rounded-md shadow-sm"
			type="text"
			placeholder="Your Name"
			bind:value={name}
			required
		/>
		<textarea
			placeholder="Your Message"
			bind:value={message}
			required
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault(); // Prevents a new line
					handleSubmit(e);
				}
			}}
			class="shadow-md p-2 h-32 rounded-md"
		></textarea>
		<input
			class="p-2 rounded-md shadow-md"
			type="text"
			placeholder="Passcode"
			bind:value={passcode}
		/>
		<button
			class="mt-2 bg-orange-400 text-white px-4 py-2 rounded-md shadow-md hover:bg-orange-500"
			type="submit"
		>
			Post
		</button>
	</form>
	<div
		class="shadow-lg {!isMobile ? 'w-1/2' : 'w-full'} p-8 bg-slate-50 dark:bg-slate-800 rounded-md"
	>
		<h3 class="text-lg font-bold mb-2">Preview:</h3>
		<div class="p-4 rounded-md bg-white dark:bg-slate-700" if={message}>
			<strong>{name || 'Your Name'} said:</strong>
			<p class="mt-2">{message || 'Your message will appear here.'}</p>
		</div>
	</div>
</section>
