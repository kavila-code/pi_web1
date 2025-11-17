import { db } from './connection.database.js';

async function mapProductsToHTML() {
  try {
    const result = await db.query(`
      SELECT p.id, p.name, p.category, p.price, p.restaurant_id, r.name as restaurant_name
      FROM products p
      JOIN restaurants r ON p.restaurant_id = r.id
      ORDER BY p.name
    `);
    
    console.log(`\n=== MAPEO DE PRODUCTOS PARA HTML ===\n`);
    console.log('Copia estos data-product-id y data-restaurant-id a las tarjetas en index.html:\n');
    
    result.rows.forEach(p => {
      console.log(`${p.name}:`);
      console.log(`  data-product-id="${p.id}"`);
      console.log(`  data-restaurant-id="${p.restaurant_id}"`);
      console.log(`  <!-- ${p.restaurant_name} - $${p.price} -->\n`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

mapProductsToHTML();
