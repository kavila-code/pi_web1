import { db } from './connection.database.js';

async function queryAllRestaurants() {
  try {
    const result = await db.query(`
      SELECT id, name, category, is_active 
      FROM restaurants 
      ORDER BY category, name
    `);
    
    console.log(`\n=== RESTAURANTES DISPONIBLES (${result.rows.length}) ===\n`);
    
    const byCategory = {};
    result.rows.forEach(restaurant => {
      if (!byCategory[restaurant.category]) {
        byCategory[restaurant.category] = [];
      }
      byCategory[restaurant.category].push(restaurant);
    });
    
    for (const [category, restaurants] of Object.entries(byCategory)) {
      console.log(`\n${category.toUpperCase()} (${restaurants.length}):`);
      restaurants.forEach(r => {
        const status = r.is_active ? '✓' : '✗';
        console.log(`  ${status} ID: ${r.id} | ${r.name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

queryAllRestaurants();
