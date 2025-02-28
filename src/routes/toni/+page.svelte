<script>
	let name = '';
	let message = '';
	let responseMessage = '';

	const submitForm = async () => {
		const formData = { name, message };

		try {
			const response = await fetch('/.netlify/functions/submitMessage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const result = await response.json();
			responseMessage = result.message;
		} catch (error) {
			responseMessage = `Error: ${error.message}`;
		}
	};
</script>

<form on:submit|preventDefault={submitForm}>
	<input bind:value={name} type="text" placeholder="Your Name" required />
	<textarea bind:value={message} placeholder="Your Message" required></textarea>
	<button type="submit">Submit</button>
</form>

{#if responseMessage}
	<p>{responseMessage}</p>
{/if}
