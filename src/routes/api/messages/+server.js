// src/routes/api/messages/+server.js
import { json } from '@sveltejs/kit';
import mysql from 'mysql2/promise';

export async function GET() {
	// Create a connection to the database
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'EkIsDieBesteNeger1',
		database: 'chadz'
	});

	try {
		// Fetch messages from the database
		const [rows] = await connection.execute('SELECT * FROM messages ORDER BY created_at DESC');
		return json(rows);
	} catch (error) {
		console.error('Database retrieval error:', error);
		return json({ error: 'Database error' }, { status: 500 });
	} finally {
		await connection.end();
	}
}
