import { db } from './connection.database.js';

async function main() {
  try {
    const { rows } = await db.query(`
      SELECT p.id, p.name, p.category, p.restaurant_id, r.name AS restaurant_name
      FROM products p
      JOIN restaurants r ON r.id = p.restaurant_id
      ORDER BY p.id
    `);

    console.log('\nID | PRODUCTO | CATEGORIA | RESTAURANT_ID | RESTAURANTE');
    console.log('----------------------------------------------------------------');
    rows.forEach(r => {
      console.log(`${r.id}\t| ${r.name}\t| ${r.category}\t| ${r.restaurant_id}\t| ${r.restaurant_name}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await db.end();
  }
}

main();
