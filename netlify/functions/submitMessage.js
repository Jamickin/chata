const mysql = require('mysql2/promise');

exports.handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return {
			statusCode: 405,
			body: JSON.stringify({ message: 'Method Not Allowed' })
		};
	}

	const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

	const connection = await mysql.createConnection({
		host: MYSQL_HOST,
		port: MYSQL_PORT,
		user: MYSQL_USER,
		password: MYSQL_PASSWORD,
		database: MYSQL_DATABASE
	});

	const { name, message } = JSON.parse(event.body);

	try {
		await connection.execute('INSERT INTO messages (name, message) VALUES (?, ?)', [name, message]);
		return {
			statusCode: 200,
			body: JSON.stringify({ message: 'Message submitted successfully' })
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ message: 'Error submitting message', error: error.message })
		};
	} finally {
		await connection.end();
	}
};
