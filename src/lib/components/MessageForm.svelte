<script>
	import { db } from '../firebase';
	import { collection, addDoc, Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
	import { onMount } from 'svelte';

	let name = $state('');
	let message = $state('');
	let messages = $state([]);
	let passcode = $state('');

	const fetchMessages = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, 'messages'));
			messages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
		} catch (error) {
			console.error('Error fetching messages:', error);
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

<section class="flex justify-around">
	<form class="w-1/2 flex flex-col p-4 space-y-4" onsubmit={handleSubmit}>
		<input
			class="p-2 border rounded-md shadow-sm"
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
			class="shadow-md p-4 h-32 rounded-md border"
		></textarea>
		<input
			class="p-2 border rounded-md shadow-sm"
			type="text"
			placeholder="Passcode"
			bind:value={passcode}
		/>
		<button
			class="mt-2 bg-orange-400 text-white px-4 py-2 rounded-md shadow-md hover:bg-orange-500"
			type="submit"
		>
			Send Message
		</button>
	</form>
	<div class="shadow-lg w-1/2 p-8 bg-slate-50 dark:bg-slate-800 rounded-md">
		<h3 class="text-lg font-bold mb-2">Preview:</h3>
		<div class="p-4 border rounded-md shadow-md bg-white dark:bg-slate-700" if={message}>
			<strong>{name || 'Your Name'} said:</strong>
			<p class="mt-2">{message || 'Your message will appear here.'}</p>
		</div>
	</div>
</section>

<section class=" grid grid-cols-2 gap-4">
	{#each messages as message (message.id)}
		<div
			class="p-4 border rounded-md shadow-md bg-white dark:bg-slate-700 flex items-center flex-col"
		>
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
</section>

<section>
	<h3>Legend:</h3>
	<ul><li><span class="opacity-35">#</span>: Post is Passcode Blocked</li></ul>
</section>
