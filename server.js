// server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

let conversationHistory = []; // Store past messages

// Proxy endpoint for Ollama
app.post('/api/chat', async (req, res) => {
	const { prompt } = req.body;

	conversationHistory.push({ role: 'user', content: prompt });

	const response = await fetch('http://localhost:11434/api/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: 'llama3.2:latest', // Your model name
			prompt: conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n'),
			stream: false // Enable streaming
		})
	});

	// Pipe Ollama's streaming response to the client
	response.body.pipe(res);
});

app.post('/api/clear', (req, res) => {
	conversationHistory.length = 0; // Clears the existing array reference
	res.json({ message: 'Chat history cleared' });
});

app.listen(3000, () => {
	console.log('Backend running on http://localhost:3000');
});
