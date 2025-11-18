// Script para verificar pedidos disponibles para domiciliarios
import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkAvailableOrders() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Ver todos los pedidos
    console.log('📋 TODOS LOS PEDIDOS:');
    const allOrders = await client.query(`
      SELECT id, order_number, status, delivery_person_id, customer_id, restaurant_id, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.table(allOrders.rows);

    // 2. Ver pedidos disponibles (según la query del modelo)
    console.log('\n🚚 PEDIDOS DISPONIBLES PARA DOMICILIARIOS:');
    console.log('Condiciones: status IN (pendiente, confirmado, preparando, listo) AND delivery_person_id IS NULL\n');
    
    const availableOrders = await client.query(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.delivery_person_id,
        r.name as restaurant_name,
        u.username as customer_name,
        o.total,
        o.created_at
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      JOIN users u ON o.customer_id = u.uid
      WHERE o.status IN ('pendiente', 'confirmado', 'preparando', 'listo') 
        AND o.delivery_person_id IS NULL
      ORDER BY o.created_at ASC
    `);

    if (availableOrders.rows.length === 0) {
      console.log('⚠️  No hay pedidos disponibles');
      console.log('\nPara crear un pedido de prueba, ejecuta:');
      console.log('  node scripts/test-create-order.js');
    } else {
      console.table(availableOrders.rows);
    }

    // 3. Contar por estado
    console.log('\n📊 PEDIDOS POR ESTADO:');
    const byStatus = await client.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `);
    console.table(byStatus.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAvailableOrders();
