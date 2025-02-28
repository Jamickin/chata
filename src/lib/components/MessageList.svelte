<!-- src/lib/MessageList.svelte -->
<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let messages = writable([]);
	let error = writable('');

	onMount(async () => {
		try {
			const response = await fetch('/api/messages');
			if (response.ok) {
				const data = await response.json();
				messages.set(data);
			} else {
				error.set('Failed to load messages.');
			}
		} catch (err) {
			error.set('An error occurred while fetching messages.');
		}
	});
</script>

{#if $error}
	<p class="text-red-500">{$error}</p>
{:else}
	<ul>
		{#each $messages as message}
			<li class="border-b py-2">
				<p><strong>{message.name}</strong> ({message.email})</p>
				<p>{message.message}</p>
				<p class="text-sm text-gray-500">{new Date(message.created_at).toLocaleString()}</p>
			</li>
		{/each}
	</ul>
{/if}
