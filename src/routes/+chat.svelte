<script>
	let input = '';
	let messages = [];
	let loading = false;
	let error = null;
	let notification = '';
	// let ngrok = 'https://neat-kindly-frog.ngrok-free.app';
	let apiBaseUrl = 'https://b9fb-197-245-43-158.ngrok-free.app';
	// Handle non-streaming response from backend
	async function generateResponse() {
		if (!input.trim()) return; // Prevent empty messages
		loading = true;
		error = null;
		notification = '';

		messages = [...messages, { role: 'user', content: input }];
		input = ''; // Clear input field immediately after sending

		try {
			const response = await fetch(apiBaseUrl + '/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: messages.map((m) => `${m.role}: ${m.content}`).join('\n')
				})
			});

			if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

			// Wait for the entire response
			const result = await response.json();
			if (result.response) {
				// Add the assistant's response to the messages
				messages = [...messages, { role: 'assistant', content: result.response }];
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

<div class="chat-container">
	<div class="messages">
		{#each messages as message, index}
			<div class="message {message.role}-message">
				{#if message.role === 'user'}
					<strong>You:</strong>
				{:else if message.content.trim() !== ''}
					<strong>AI:</strong>
				{/if}
				<div class="message-content">{message.content}</div>
			</div>
		{/each}
	</div>

	<div class="input-group">
		<input
			type="text"
			bind:value={input}
			placeholder="Type your message..."
			disabled={loading}
			on:keydown={(e) => e.key === 'Enter' && generateResponse()}
		/>
		<button on:click={generateResponse} disabled={loading || !input.trim()}>
			{loading ? '...' : 'Send'}
		</button>
		<button on:click={clearChat} class="clear-btn">Clear</button>
	</div>

	{#if notification}
		<div class="notification success">{notification}</div>
	{/if}

	{#if error}
		<div class="error">{error}</div>
	{/if}
</div>

<style>
	.chat-container {
		max-width: 600px;
		margin: auto;
		padding: 1rem;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		height: 85vh;
		max-height: 90vh;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		background: #f9f9f9;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.message {
		padding: 10px;
		margin-bottom: 10px;
		border-radius: 8px;
		word-wrap: break-word;
		font-size: 0.95rem;
	}

	.user-message {
		background: #007bff;
		color: white;
		align-self: flex-end;
		text-align: right;
		margin-left: auto;
		max-width: 75%;
	}

	.assistant-message {
		background: #ececec;
		color: black;
		align-self: flex-start;
		margin-right: auto;
		max-width: 75%;
	}

	.input-group {
		display: flex;
		gap: 0.5rem;
		width: 100%;
	}

	input {
		flex: 1;
		padding: 12px;
		border: 1px solid #ccc;
		border-radius: 8px;
		font-size: 1rem;
		outline: none;
	}

	button {
		padding: 12px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s;
	}

	button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.clear-btn {
		background: #dc3545;
	}

	.clear-btn:hover {
		background: #c82333;
	}

	@media (max-width: 768px) {
		.chat-container {
			width: 95%;
			height: 90vh;
		}

		.messages {
			padding: 0.8rem;
			font-size: 0.9rem;
		}

		.input-group {
			flex-direction: column;
			gap: 0.4rem;
		}

		input {
			padding: 10px;
			font-size: 1rem;
		}

		button {
			width: 100%;
			font-size: 1rem;
			padding: 10px;
		}
	}
</style>
