import { db } from './connection.database.js';

async function checkRestaurants() {
  try {
    const res = await db.query('SELECT id, name, is_active FROM restaurants ORDER BY id');
    console.log('Restaurantes:');
    res.rows.forEach(r => {
      console.log(`ID: ${r.id}, Nombre: ${r.name}, Activo: ${r.is_active}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkRestaurants();
