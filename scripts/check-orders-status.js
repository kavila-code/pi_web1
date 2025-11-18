import { db } from '../database/connection.database.js';

async function checkOrders() {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        order_number, 
        status, 
        delivery_person_id, 
        delivery_fee, 
        created_at 
      FROM orders 
      ORDER BY id DESC 
      LIMIT 10
    `);

    console.log('\n📦 Últimos 10 pedidos:\n');
    console.table(result.rows);

    const deliveredResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM orders 
      WHERE status = 'entregado'
    `);

    console.log(`\n✅ Total de pedidos entregados: ${deliveredResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkOrders();
