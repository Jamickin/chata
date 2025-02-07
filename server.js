import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import multer from 'multer'; // For handling file uploads
import fs from 'fs';
import path from 'path';

const uploadedBooks = []; // Store multiple books

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files will be temporarily stored in the 'uploads' folder

let conversationHistory = []; // Store past messages

// Proxy endpoint for Ollama
app.post('/api/chat', async (req, res) => {
	const { prompt } = req.body;

	conversationHistory.push({ role: 'user', content: prompt });

	const response = await fetch('http://localhost:11434/api/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: 'deepseek-r1:1.5b', // Your model name
			prompt: conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n'),
			stream: false // Enable streaming
		})
	});

	// Pipe Ollama's streaming response to the client
	response.body.pipe(res);
});

// Endpoint to handle book uploads
app.post('/api/upload-book', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		const filePath = req.file.path;
		const fileExtension = path.extname(req.file.originalname).toLowerCase();

		let bookContent = '';

		// Read the file based on its type
		if (fileExtension === '.txt') {
			bookContent = fs.readFileSync(filePath, 'utf-8');
		} else if (fileExtension === '.pdf') {
			// For PDF files, you can use a library like `pdf-parse` to extract text
			const pdf = require('pdf-parse');
			const dataBuffer = fs.readFileSync(filePath);
			const data = await pdf(dataBuffer);
			bookContent = data.text;
		} else if (fileExtension === '.epub') {
			// For EPUB files, you can use a library like `epub` to extract text
			const epub = require('epub');
			const epubBook = new epub(filePath);
			bookContent = await new Promise((resolve, reject) => {
				let content = '';
				epubBook.on('end', () => resolve(content));
				epubBook.on('data', (chunk) => (content += chunk));
				epubBook.on('error', reject);
				epubBook.parse();
			});
		} else {
			fs.unlinkSync(filePath); // Delete the uploaded file if it's not supported
			return res.status(400).json({ error: 'Unsupported file format' });
		}

		// Delete the uploaded file after processing
		fs.unlinkSync(filePath);

		const bookId = Date.now().toString(); // Unique identifier
		uploadedBooks.push({ id: bookId, name: req.file.originalname, content: bookContent });

		// Return the book content to the frontend
		res.json({ message: 'Book uploaded successfully', bookId, name: req.file.originalname });
	} catch (err) {
		console.error('Error processing book upload:', err);
		res.status(500).json({ error: 'Failed to process the uploaded book' });
	}
});

// Endpoint to get all uploaded books
app.get('/api/books', (req, res) => {
	res.json(uploadedBooks.map((book) => ({ id: book.id, name: book.name })));
});

// Endpoint to get a book by ID
app.get('/api/book/:id', (req, res) => {
	const book = uploadedBooks.find((b) => b.id === req.params.id);
	if (!book) return res.status(404).json({ error: 'Book not found' });
	res.json({ content: book.content });
});

app.post('/api/clear', (req, res) => {
	conversationHistory.length = 0; // Clears the existing array reference
	res.json({ message: 'Chat history cleared' });
});

// Endpoint to get conversation history
app.get('/api/messages', (req, res) => {
	res.json(conversationHistory); // Return the current conversation history
});

app.listen(3001, () => {
	console.log('Backend running on http://localhost:3001');
});
