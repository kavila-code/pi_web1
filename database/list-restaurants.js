import { db } from './connection.database.js';

async function listRestaurants() {
  try {
    const result = await db.query('SELECT id, name, category FROM restaurants ORDER BY id');
    console.log('\nRestaurantes en la base de datos:');
    console.log('=====================================');
    result.rows.forEach(r => {
      console.log(`${r.id}. ${r.name} (${r.category || 'Sin categoría'})`);
    });
    console.log(`\nTotal: ${result.rows.length} restaurantes\n`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

listRestaurants();
