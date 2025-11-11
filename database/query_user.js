import { db } from './connection.database.js';

async function queryUser(email) {
  try {
    const res = await db.query('SELECT uid, email, username, created_at FROM users WHERE email = $1', [email]);
    console.log(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

queryUser(process.argv[2] || 'testbot2025+3@example.com');
