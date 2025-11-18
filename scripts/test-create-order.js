// Quick test: login, fetch products, create order (uses global fetch on Node >=18)

const BASE = 'http://localhost:3000/api/v1';

async function main() {
  try {
    const email = 'test-order@example.com';
    const password = 'password123';
    // 1) Login o registrar si no existe
    let loginRes = await fetch(`${BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    let loginData = await loginRes.json();
    if (loginRes.status === 404) {
      // Registrar usuario y reintentar login
      console.log('Usuario no existe, registrando...');
      const regRes = await fetch(`${BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test-order', email, password })
      });
      const reg = await regRes.json();
      if (!regRes.ok) {
        console.error('Registro falló:', regRes.status, reg);
        process.exit(1);
      }
      loginRes = await fetch(`${BASE}/users/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      loginData = await loginRes.json();
    }
    if (!loginRes.ok || !loginData.token) {
      console.error('Login failed:', loginRes.status, loginData);
      process.exit(1);
    }
    const token = loginData.token;
    console.log('Login OK, uid=', loginData.user?.uid);

    // 2) Obtener productos destacados
    const featRes = await fetch(`${BASE}/products/featured?limit=12`);
    const feat = await featRes.json();
    if (!featRes.ok || !feat.ok) {
      console.error('Featured fetch failed:', featRes.status, feat);
      process.exit(1);
    }
    const items = Array.isArray(feat.data) ? feat.data : [];
    if (items.length === 0) {
      console.error('No featured products available');
      process.exit(1);
    }

    // 3) Elegir productos del mismo restaurante
    const byRest = items.reduce((acc, p) => {
      if (!p.restaurant_id) return acc;
      acc[p.restaurant_id] = acc[p.restaurant_id] || [];
      acc[p.restaurant_id].push(p);
      return acc;
    }, {});
    const restId = Object.keys(byRest)[0];
    const chosen = byRest[restId].slice(0, 2); // 1 o 2 items del mismo restaurante

    const orderItems = chosen.map(p => ({ product_id: p.id, quantity: 1 }));

    const orderBody = {
      restaurant_id: Number(restId),
      delivery_address: 'Calle 123 #45-67',
      delivery_phone: '3001234567',
      delivery_notes: 'Pedido de prueba',
      payment_method: 'efectivo',
      items: orderItems,
    };

    // 4) Crear pedido
    const createRes = await fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderBody)
    });
    const createData = await createRes.json();
    console.log('Create order status:', createRes.status);
    console.log(JSON.stringify(createData, null, 2));

    if (!createRes.ok) process.exit(1);
    console.log('Order created OK. ID:', createData?.data?.id || createData?.data?.order_id);
    process.exit(0);
  } catch (e) {
    console.error('Test error:', e);
    process.exit(1);
  }
}

main();
