<script>
	import { onMount } from 'svelte';
	import ePub from 'epubjs';

	let input = $state('');
	let messages = $state([]);
	let loading = $state(false);
	let error = $state(null);
	let notification = $state('');
	let apiBaseUrl = 'https://neat-kindly-frog.ngrok-free.app';
	let minimized = $state(false);
	let isMobile = $state(false);
	let book;
	let rendition;
	let highlightedText = $state('');
	let showModal = $state(true);
	let currentPage = $state(1); // Track the current page for context in the prompt

	function checkWindowWidth() {
		isMobile = window.innerWidth <= 800;
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
				messages = [...messages, { role: 'assistant', content: 'No response received.' }];
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
		localStorage.removeItem('chatMessages'); // Always clear local storage

		try {
			const response = await fetch(apiBaseUrl + '/api/clear', { method: 'POST' });
			if (response.ok) {
				notification = 'Chat history cleared successfully!';
			} else {
				throw new Error('Failed to clear chat');
			}
		} catch (err) {
			console.error(err);
			error = 'Chat cleared locally, but server request failed';
		}
	}

	function handleFileUpload(event) {
		const file = event.target.files[0];
		if (!file) {
			error = 'No file selected';
			return;
		}

		try {
			book = ePub(file);
			rendition = book.renderTo('viewer', {
				width: '100%',
				height: '100%'
			});
			const iframe = document.querySelector('iframe');
			if (iframe) iframe.sandbox = 'allow-scripts allow-same-origin allow-popups';
			rendition.display();
			rendition.on('rendered', (section) => {
				currentPage = section.index; // Track the page number as the eBook is rendered
			});
		} catch (err) {
			error = 'Failed to load EPUB file';
			console.error(err);
		}
	}

	function nextPage() {
		if (rendition) {
			rendition.next();
		}
	}

	function prevPage() {
		if (rendition) {
			rendition.prev();
		}
	}

	// Detect text selection
	function handleTextSelection() {
		const selectedText = window.getSelection().toString().trim();
		if (selectedText) {
			highlightedText = selectedText;
		}
	}

	// Send highlighted text to AI with context
	async function sendToAI() {
		const prompt = `Who/What is ${highlightedText}? I'm on page ${currentPage}. The book is Mistborn, Final Empire. Don't spoil anything.`;
		highlightedText = ''; // Clear the highlighted text
		input = ''; // Optionally reset the input box

		// Call the AI with the prompt
		await generateResponse();
	}

	// Close the modal without sending
	function closeModal() {
		showModal = false;
		highlightedText = ''; // Clear the highlighted text
	}

	console.log(currentPage);
</script>

<div>
	<input type="file" accept=".epub" onchange={handleFileUpload} />
	<button id="viewer" class="iframe" aria-label="EPUB Viewer" onmouseup={handleTextSelection}
	></button>
	<div class="pagination-controls">
		<button onclick={prevPage}>Previous</button>
		<button onclick={nextPage}>Next</button>
	</div>
</div>

{#if showModal}
	<div class="modal-overlay">
		<div class="modal">
			<p><strong>Highlighted:</strong> {highlightedText}</p>
			<p>Send this to the AI?</p>
			<button onclick={sendToAI}>Send</button>
			<button onclick={closeModal}>Cancel</button>
		</div>
	</div>
{/if}

<div
	class="glass {isMobile ? 'w-full' : 'w-96'} fixed right-0 bottom-0 {minimized
		? 'h-0'
		: 'h-[500px]'} "
>
	<button
		class="w-full h-8 bg-blue-400 text-white absolute -top-8"
		onclick={() => (minimized = !minimized)}
	>
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
	.iframe {
		width: 100%;
		height: 500px;
		border: 1px solid #ccc;
		margin-bottom: 20px;
	}
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 200px;
		height: 200px;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal {
		background: white;
		padding: 20px;
		border-radius: 10px;
		text-align: center;
	}
	.modal button {
		margin: 10px;
	}
</style>
