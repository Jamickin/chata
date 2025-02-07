<script>
	import { onMount } from 'svelte';

	let ngrok = 'https://5a38-197-245-137-103.ngrok-free.app';
	let books = [];
	let selectedBookId = null;
	let bookContent = '';
	let currentPage = 1;
	let error = null;
	let notification = '';
	let input = '';
	let messages = [];
	let loading = false;

	onMount(async () => {
		try {
			const response = await fetch('/api/books'); // Fetch book list
			const data = await response.json();
			books = data; // Assign book data
		} catch (error) {
			console.error('Failed to load books:', error);
		}
	});

	async function generateResponse() {
		if (!input.trim()) return; // Prevent empty messages
		loading = true;
		error = null;
		notification = '';

		messages = [...messages, { role: 'user', content: input }];
		input = ''; // Clear input field immediately after sending

		try {
			const response = await fetch(ngrok + '/api/chat', {
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

	// Fetch available books
	// Fetch available books
	async function fetchBooks() {
		try {
			const response = await fetch(ngrok + '/api/books'); // Fetch from correct API endpoint
			if (!response.ok) throw new Error('Failed to fetch books');
			books = await response.json();
			if (books.length > 0) {
				selectedBookId = books[0].id;
				loadBook(selectedBookId);
			}
		} catch (err) {
			error = err.message;
		}
	}

	// Load a book by ID
	async function loadBook(bookId) {
		try {
			const response = await fetch(`${ngrok}/api/book/${bookId}`);
			if (!response.ok) throw new Error('Failed to load book');
			const result = await response.json();
			bookContent = result.content;
			currentPage = 1; // Reset to first page
		} catch (err) {
			error = err.message;
		}
	}

	// Handle file upload
	async function handleBookUpload(event) {
		const file = event.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch(ngrok + '/api/upload-book', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) throw new Error('Failed to upload book');
			const result = await response.json();

			notification = 'Book uploaded successfully!';
			books.push({ id: result.bookId, name: result.name });
			loadBook(result.bookId);
		} catch (err) {
			error = err.message;
		}
	}

	// Change book selection
	function changeBook(event) {
		selectedBookId = event.target.value;
		loadBook(selectedBookId);
	}

	// Pagination functions
	function loadPage(pageNumber) {
		if (!bookContent) return '';

		const pages = bookContent.split('\n\n'); // Split content into sections
		const totalPages = pages.length;

		if (pageNumber < 1) currentPage = 1;
		if (pageNumber > totalPages) currentPage = totalPages;

		return pages[currentPage - 1];
	}

	function nextPage() {
		currentPage += 1;
	}

	function prevPage() {
		currentPage -= 1;
	}
	async function clearChat() {
		messages = [];
		input = '';
		notification = '';
		error = null;

		try {
			const response = await fetch(ngrok + '/api/clear', {
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
	// Fetch books on mount
	fetchBooks();
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
	<!-- Book Upload Section -->
	<div class="upload-section">
		<input type="file" accept=".txt,.pdf" on:change={handleBookUpload} />
	</div>

	{#if books.length > 0}
		<div class="book-selection">
			<label for="book-select">Select Book:</label>
			<select id="book-select" bind:value={selectedBookId} on:change={changeBook}>
				{#each books as book}
					<option value={book.id}>{book.name}</option>
				{/each}
			</select>
		</div>

		<div class="book-reader">
			<h3>Book Reader</h3>
			<div class="page-content">
				{loadPage(currentPage)}
			</div>
			<div class="pagination">
				<button on:click={prevPage} disabled={currentPage <= 1}>Previous</button>
				<span>Page {currentPage}</span>
				<button on:click={nextPage} disabled={currentPage >= bookContent.split('\n\n').length}>
					Next
				</button>
			</div>
		</div>
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
	.upload-section {
		margin-top: 20px;
	}

	.book-reader {
		margin-top: 20px;
	}

	.page-content {
		padding: 1rem;
		background: #f9f9f9;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.pagination {
		display: flex;
		gap: 0.5rem;
	}

	.pagination button {
		padding: 10px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
	}

	.pagination button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
</style>
