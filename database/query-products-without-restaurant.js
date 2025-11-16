import { db } from './connection.database.js';

async function queryProductsWithoutRestaurant() {
  try {
    const result = await db.query(`
      SELECT id, name, category, restaurant_id, price 
      FROM products 
      WHERE restaurant_id IS NULL OR restaurant_id = 0 
      ORDER BY category, name
    `);
    
    console.log(`\n=== PRODUCTOS SIN RESTAURANTE (${result.rows.length}) ===\n`);
    
    const byCategory = {};
    result.rows.forEach(product => {
      if (!byCategory[product.category]) {
        byCategory[product.category] = [];
      }
      byCategory[product.category].push(product);
    });
    
    for (const [category, products] of Object.entries(byCategory)) {
      console.log(`\n${category.toUpperCase()} (${products.length}):`);
      products.forEach(p => {
        console.log(`  - ID: ${p.id} | ${p.name} | $${p.price}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

queryProductsWithoutRestaurant();
