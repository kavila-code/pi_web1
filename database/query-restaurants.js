import { db } from './connection.database.js';

async function queryRestaurants() {
  try {
    const res = await db.query('SELECT id, name, logo_url FROM restaurants ORDER BY id');
    console.log('Restaurantes en DB:');
    res.rows.forEach(r => {
      console.log(`ID: ${r.id}, Nombre: ${r.name}, Logo: ${r.logo_url}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

queryRestaurants();
