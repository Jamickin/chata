<script>
	import MessageList from '$lib/components/MessageList.svelte';
	export let form;
</script>

<MessageList />

{#if form?.success}
	<p class="text-green-500">Thank you for your message!</p>
{:else}
	{#if form?.error}
		<p class="text-red-500">{form.error}</p>
	{/if}
	<form method="POST" class="space-y-4">
		<div>
			<label for="name" class="block">Name:</label>
			<input id="name" name="name" class="border p-2 w-full" required />
		</div>
		<div>
			<label for="email" class="block">Email:</label>
			<input id="email" name="email" type="email" class="border p-2 w-full" required />
		</div>
		<div>
			<label for="message" class="block">Message:</label>
			<textarea id="message" name="message" class="border p-2 w-full" required></textarea>
		</div>
		<button type="submit" class="bg-blue-500 text-white p-2">Send Message</button>
	</form>
{/if}
