import { db } from './connection.database.js';

const restaurantId = process.argv[2];
if (!restaurantId) {
  console.error('Uso: node database/query-products-by-restaurant.js <restaurantId>');
  process.exit(1);
}

(async () => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, category, image_url FROM products WHERE restaurant_id = $1 ORDER BY category, name`,
      [restaurantId]
    );
    console.log(`Productos de restaurante ${restaurantId}:`);
    rows.forEach(p => console.log(`${p.id}\t${p.category}\t${p.name}\t${p.image_url || ''}`));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
