import { db } from './connection.database.js';

async function fixCreatedAt() {
  try {
    console.log('Updating users.created_at default...');
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await db.query(`ALTER TABLE users ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP`);

    const res = await db.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`);
    console.log('Users table columns:');
    res.rows.forEach(r => console.log(` - ${r.column_name} | ${r.data_type} | nullable=${r.is_nullable} | default=${r.column_default}`));

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating users.created_at:', err);
    process.exit(1);
  }
}

fixCreatedAt();
