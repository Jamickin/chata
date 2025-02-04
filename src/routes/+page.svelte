<!-- src/routes/Chat.svelte -->
<script>
	let input = '';
	let messages = [];
	let loading = false;
	let error = null;

	// Handle streaming response from backend
	async function generateResponse() {
		loading = true;
		error = null;

		try {
			const response = await fetch('https://9389-197-245-137-103.ngrok-free.app/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: input })
			});

			if (!response.ok) throw new Error('API request failed');

			messages = [...messages, { role: 'user', content: input }];
			input = '';

			messages = [...messages, { role: 'assistant', content: '' }];
			const assistantIndex = messages.length - 1;

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });

				// Process complete JSON objects from the stream
				const jsonObjects = buffer.split('\n').filter((line) => line.trim() !== '');
				buffer = '';

				for (const jsonString of jsonObjects) {
					try {
						const parsed = JSON.parse(jsonString);
						if (parsed.response) {
							messages[assistantIndex].content += parsed.response;
							messages = [...messages]; // Force Svelte to re-render
						}
					} catch (e) {
						console.error('Error parsing chunk:', e);
					}
				}
			}
		} catch (err) {
			error = err.message || 'Failed to generate response';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(e) {
		if (e.key === 'Enter' && !e.shiftKey && !loading) {
			e.preventDefault();
			generateResponse();
		}
	}
</script>

<div class="chat-container">
	<div class="messages">
		{#each messages as message, index}
			<div class="message {message.role}-message">
				{#if message.role === 'user'}
					<strong>You:</strong>
				{:else}
					<strong>AI:</strong>
				{/if}
				{message.content}
			</div>
		{/each}
	</div>

	<div class="input-group">
		<input
			type="text"
			bind:value={input}
			on:keydown={handleKeyPress}
			placeholder="Type your message..."
			disabled={loading}
		/>
		<button on:click={generateResponse} disabled={loading || !input.trim()}>
			{loading ? 'Generating...' : 'Send'}
		</button>
	</div>

	{#if error}
		<div class="error">{error}</div>
	{/if}
</div>

<style>
	.chat-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
	}

	.messages {
		min-height: 400px;
		max-height: 60vh;
		overflow-y: auto;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.message {
		margin-bottom: 1rem;
		padding: 0.5rem;
		border-radius: 4px;
	}

	.user-message {
		background: #e3f2fd;
		margin-left: 20%;
	}

	.assistant-message {
		background: #f5f5f5;
		margin-right: 20%;
	}

	.input-group {
		display: flex;
		gap: 0.5rem;
	}

	input {
		flex: 1;
		padding: 0.8rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	button {
		padding: 0.8rem 1.5rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:disabled {
		background: #6c757d;
		cursor: not-allowed;
	}

	.loading {
		color: #6c757d;
		font-style: italic;
	}

	.error {
		color: #dc3545;
		margin-top: 1rem;
	}
</style>
