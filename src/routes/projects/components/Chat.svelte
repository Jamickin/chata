<script>
	import { onMount } from 'svelte';

	let input = $state('');
	let messages = $state([]);
	let loading = $state(false);
	let error = $state(null);
	let notification = $state('');
	let apiBaseUrl = 'https://neat-kindly-frog.ngrok-free.app';
	let minimized = $state(true);
	let isMobile = $state(false);

	function checkWindowWidth() {
		isMobile = window.innerWidth <= 1026;
	}

	onMount(() => {
		if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
			messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
		}
		checkWindowWidth();
		window.addEventListener('resize', checkWindowWidth);
		return () => window.removeEventListener('resize', checkWindowWidth);
	});

	function saveMessages() {
		if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
			localStorage.setItem('chatMessages', JSON.stringify(messages));
		}
	}

	async function generateResponse() {
		loading = true;
		error = null;
		notification = '';

		messages = [...messages, { role: 'user', content: input }];
		saveMessages(); // Save after adding user input
		input = '';

		try {
			const response = await fetch(apiBaseUrl + '/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: messages.map((m) => `${m.role}: ${m.content}`).join('\n')
				})
			});

			if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

			const result = await response.json();
			if (result.response) {
				messages = [...messages, { role: 'assistant', content: result.response }];
				saveMessages(); // Save after adding AI response
			} else {
				console.warn('Response is missing "response" field:', result);
			}
		} catch (err) {
			error = `Error: ${err.message || 'Failed to generate response'}`;
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function clearChat() {
		messages = [];
		input = '';
		notification = '';
		error = null;

		if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
			localStorage.removeItem('chatMessages'); // Clear storage
		}

		try {
			const response = await fetch(apiBaseUrl + '/api/clear', {
				method: 'POST'
			});
			if (response.ok) {
				notification = 'Chat history cleared successfully!';
			} else {
				throw new Error('Failed to clear chat');
			}
		} catch (err) {
			error = err.message || 'Failed to clear chat history';
			console.error(err);
		}
	}
</script>

<div
	class="glass {isMobile ? 'w-full' : 'w-96'} fixed right-0 bottom-[-2rem] {minimized
		? 'h-16'
		: 'h-[500px]'} "
>
	<button class="w-full h-16 bg-blue-400 text-white" onclick={() => (minimized = !minimized)}>
		{minimized ? 'Maximize' : 'Minimize'}
	</button>
	{#if !minimized}
		<div class="overflow-y-scroll p-2 h-full w-full rounded-t-2xl shadow-lg">
			{#each messages as message, index}
				<div>
					{#if message.role === 'user'}
						<div class="bg-blue-200 p-4 rounded-4xl rounded-tr-none text-right">
							<strong>You:</strong>
							{message.content}
						</div>
					{:else if message.role === 'assistant'}
						<div class="bg-green-200 p-4 rounded-4xl rounded-tl-none">
							<strong>AI:</strong>
							{message.content}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div>
			<input
				class="bg-white p-2 rounded-2xl w-full"
				type="text"
				bind:value={input}
				placeholder="Type your message..."
				disabled={loading || minimized}
				onkeydown={(e) => {
					if (e.key === 'Enter' && input !== '') {
						generateResponse();
					}
				}}
			/>
			<div class="">
				<button
					class="p-2 bg-blue-400 text-white hover:opacity-80 rounded-2xl w-20 {loading
						? 'opacity-50'
						: ''} {input === '' ? 'cursor-not-allowed' : ''}"
					onclick={generateResponse}
					disabled={loading || input === ''}
				>
					{loading ? '...' : 'Send'}
				</button>
				<button
					class="p-2 bg-red-400 text-white hover:opacity-80 rounded-2xl w-20"
					onclick={clearChat}
				>
					Clear
				</button>
			</div>
		</div>

		{#if notification}
			<div class="font-bold">{notification}</div>
		{/if}

		{#if error}
			<div class="text-red font-bold">{error}</div>
		{/if}
	{/if}
</div>

<style>
	/* Add your styles here */
</style>
