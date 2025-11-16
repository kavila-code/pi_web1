import { db } from './connection.database.js';

async function queryAllProducts() {
  try {
    const result = await db.query(`
      SELECT p.id, p.name, p.category, p.restaurant_id, p.price, r.name as restaurant_name
      FROM products p
      LEFT JOIN restaurants r ON p.restaurant_id = r.id
      ORDER BY p.category, p.name
    `);
    
    console.log(`\n=== TODOS LOS PRODUCTOS (${result.rows.length}) ===\n`);
    
    const withoutRestaurant = result.rows.filter(p => !p.restaurant_id || p.restaurant_id === 0);
    const withRestaurant = result.rows.filter(p => p.restaurant_id && p.restaurant_id !== 0);
    
    console.log(`\nCON RESTAURANTE: ${withRestaurant.length}`);
    console.log(`SIN RESTAURANTE: ${withoutRestaurant.length}`);
    
    if (withoutRestaurant.length > 0) {
      console.log('\n=== PRODUCTOS SIN RESTAURANTE ===\n');
      const byCategory = {};
      withoutRestaurant.forEach(product => {
        if (!byCategory[product.category]) {
          byCategory[product.category] = [];
        }
        byCategory[product.category].push(product);
      });
      
      for (const [category, products] of Object.entries(byCategory)) {
        console.log(`\n${category} (${products.length}):`);
        products.forEach(p => {
          console.log(`  - ID: ${p.id} | ${p.name} | $${p.price} | restaurant_id: ${p.restaurant_id}`);
        });
      }
    }
    
    // Mostrar distribución por categoría
    console.log('\n=== DISTRIBUCIÓN POR CATEGORÍA ===\n');
    const categoryCount = {};
    result.rows.forEach(p => {
      if (!categoryCount[p.category]) {
        categoryCount[p.category] = 0;
      }
      categoryCount[p.category]++;
    });
    
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`${cat}: ${count} productos`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

queryAllProducts();
