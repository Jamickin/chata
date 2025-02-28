// src/routes/api/messages/+server.js
import { json } from '@sveltejs/kit';
import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from '$env/static/private';

export async function GET() {
	// Create a connection to the database
	const connection = await mysql.createConnection({
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME
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
