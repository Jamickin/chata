<script>
	import { db } from '../firebase';
	import { collection, addDoc, Timestamp } from 'firebase/firestore';

	import { messages, fetchMessages } from '../messages';
	import { onMount } from 'svelte';

	onMount(() => {
		fetchMessages();
	});

	// Reactive state variables
	let name = '';
	let message = '';
	let date = Timestamp.now();

	// Function to handle form submission
	const handleSubmit = async () => {
		try {
			await addDoc(collection(db, 'messages'), {
				name,
				message,
				date
			});
			// Clear the form fields after submission
			name = '';
			message = '';
		} catch (error) {
			console.error('Error adding document: ', error);
		}
	};
</script>

<form on:submit|preventDefault={handleSubmit}>
	<input type="text" placeholder="Your Name" bind:value={name} required />
	<textarea placeholder="Your Message" bind:value={message} required></textarea>
	<button type="submit">Send Message</button>
</form>

{#each $messages as message (message.id)}
	<div>
		<strong>{message.name}</strong>
		<p>{message.message}</p>
		<time>{new Date(message.date.seconds * 1000).toLocaleString()}</time>
	</div>
{/each}
