// src/routes/toni/+page.server.js
import { fail } from '@sveltejs/kit';
import mysql from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from '$env/static/private';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const email = formData.get('email');
		const message = formData.get('message');

		// Validate form data
		if (!name || !email || !message) {
			return fail(400, { error: 'All fields are required.' });
		}

		// Connect to the MySQL database
		const connection = await mysql.createConnection({
			host: DB_HOST,
			user: DB_USER,
			password: DB_PASSWORD,
			database: DB_NAME
		});

		try {
			// Insert the message into the database
			const [result] = await connection.execute(
				'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
				[name, email, message]
			);

			return { success: true, id: result.insertId };
		} catch (error) {
			console.error('Database insertion error:', error);
			return fail(500, { error: 'Database error' });
		} finally {
			await connection.end();
		}
	}
};
