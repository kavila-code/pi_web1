// Probar endpoint de pedidos disponibles para domiciliarios
const BASE_URL = 'http://localhost:3000/api/v1';

async function testAvailableOrders() {
  try {
    console.log('🔐 Paso 1: Login como domiciliario...\n');
    
    // Login como delivery@test.com
    const loginRes = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'delivery@test.com',
        password: '123456'
      })
    });

    const loginData = await loginRes.json();
    
    if (!loginRes.ok || !loginData.token) {
      console.error('❌ Login falló:', loginData);
      console.log('\nℹ️  Si el usuario no existe, créalo con:');
      console.log('   node scripts/create-test-users.js');
      return;
    }

    const token = loginData.token;
    console.log('✅ Login exitoso');
    console.log('   Usuario:', loginData.user.email);
    console.log('   Roles:', loginData.user.roles || 'N/A');
    console.log('   Token:', token.substring(0, 20) + '...\n');

    console.log('📋 Paso 2: Obtener pedidos disponibles...\n');

    const ordersRes = await fetch(`${BASE_URL}/orders/available`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const ordersData = await ordersRes.json();

    console.log('Respuesta del servidor:');
    console.log('Status:', ordersRes.status);
    console.log('Headers:', Object.fromEntries(ordersRes.headers.entries()));
    console.log('\nBody:');
    console.log(JSON.stringify(ordersData, null, 2));

    if (ordersData.success && ordersData.orders) {
      console.log(`\n✅ ${ordersData.orders.length} pedidos disponibles:`);
      ordersData.orders.forEach(o => {
        console.log(`   - Pedido #${o.id} (${o.order_number})`);
        console.log(`     Estado: ${o.status}`);
        console.log(`     Restaurante: ${o.restaurant_name}`);
        console.log(`     Cliente: ${o.customer_name}`);
        console.log(`     Total: $${Number(o.total).toLocaleString('es-CO')}`);
        console.log('');
      });
    } else if (ordersData.data) {
      console.log(`\n✅ ${ordersData.data.length} pedidos en data:`);
      console.log(ordersData.data);
    } else {
      console.log('\n⚠️  Formato de respuesta inesperado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAvailableOrders();
