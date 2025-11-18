import { db } from '../database/connection.database.js';
import jwt from 'jsonwebtoken';

async function testEarningsEndpoint() {
  try {
    // Obtener usuario test@test.com (uid=8)
    const userResult = await db.query(`
      SELECT uid, email 
      FROM users 
      WHERE uid = 8
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('👤 Usuario:', user.email);

    // Generar token
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('\n🔑 Token generado');

    // Hacer petición al endpoint
    const response = await fetch('http://localhost:3000/api/v1/orders/my-earnings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📡 Response status:', response.status);

    const data = await response.json();
    console.log('\n📊 Datos de ganancias:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log('\n✅ Endpoint funcionando correctamente!');
      console.log(`💰 Ganancias totales: $${data.data.totalEarnings.toLocaleString('es-CO')}`);
      console.log(`📅 Ganancias del mes: $${data.data.monthEarnings.toLocaleString('es-CO')}`);
      console.log(`📦 Entregas completadas: ${data.data.completedDeliveries}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testEarningsEndpoint();
