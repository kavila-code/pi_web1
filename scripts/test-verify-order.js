// Verify order details: login/register, optionally create an order, then validate totals and items
const BASE = 'http://localhost:3000/api/v1';

function toNumber(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/\$/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function nearlyEqual(a, b, eps = 0.01) {
  return Math.abs(a - b) <= eps;
}

async function ensureAuth(email, password) {
  let loginRes = await fetch(`${BASE}/users/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  let loginData = await loginRes.json();
  if (loginRes.status === 404) {
    const regRes = await fetch(`${BASE}/users/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test-verify', email, password })
    });
    const reg = await regRes.json();
    if (!regRes.ok) throw new Error(`Registro falló: ${regRes.status} ${JSON.stringify(reg)}`);
    loginRes = await fetch(`${BASE}/users/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    loginData = await loginRes.json();
  }
  if (!loginRes.ok || !loginData.token) throw new Error(`Login falló: ${loginRes.status} ${JSON.stringify(loginData)}`);
  return { token: loginData.token, user: loginData.user };
}

async function pickProductsSameRestaurant(limit = 2) {
  const featRes = await fetch(`${BASE}/products/featured?limit=12`);
  const feat = await featRes.json();
  if (!featRes.ok || !feat.ok) throw new Error(`Featured fetch failed: ${featRes.status}`);
  const items = Array.isArray(feat.data) ? feat.data : [];
  if (!items.length) throw new Error('No featured products available');
  const byRest = items.reduce((acc, p) => {
    if (!p.restaurant_id) return acc;
    (acc[p.restaurant_id] = acc[p.restaurant_id] || []).push(p);
    return acc;
  }, {});
  const restId = Object.keys(byRest)[0];
  const chosen = byRest[restId].slice(0, limit);
  return { restaurant_id: Number(restId), products: chosen };
}

async function createOrder(token) {
  const { restaurant_id, products } = await pickProductsSameRestaurant(2);
  const items = products.map(p => ({ product_id: p.id, quantity: 1 }));
  const expectedSubtotal = products.reduce((s, p) => s + toNumber(p.price), 0);
  const deliveryFee = 3000;
  const tax = expectedSubtotal * 0.19;
  const expectedTotal = expectedSubtotal + deliveryFee + tax;

  const orderBody = {
    restaurant_id,
    delivery_address: 'Calle 123 #45-67',
    delivery_phone: '3001234567',
    delivery_notes: 'Verificación automática',
    payment_method: 'efectivo',
    items,
  };

  const res = await fetch(`${BASE}/orders`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(orderBody)
  });
  const data = await res.json();
  if (!res.ok || !data?.data?.id) throw new Error(`Create order failed: ${res.status} ${JSON.stringify(data)}`);
  return { id: data.data.id, expectedSubtotal, expectedTotal, deliveryFee };
}

async function fetchOrder(token, id) {
  const res = await fetch(`${BASE}/orders/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok || !data?.data) throw new Error(`Fetch order failed: ${res.status} ${JSON.stringify(data)}`);
  return data.data;
}

function verify(order, expectations) {
  const { expectedSubtotal, expectedTotal, deliveryFee } = expectations;
  const subtotalNum = toNumber(order.subtotal);
  const totalNum = toNumber(order.total);
  const taxNum = toNumber(order.tax_amount);
  const feeNum = toNumber(order.delivery_fee);

  const itemsSubtotal = (order.items || []).reduce((s, it) => s + toNumber(it.subtotal), 0);
  const computedTax = expectedSubtotal * 0.19;

  const ok = [
    nearlyEqual(subtotalNum, expectedSubtotal),
    nearlyEqual(itemsSubtotal, expectedSubtotal),
    nearlyEqual(feeNum, deliveryFee),
    nearlyEqual(taxNum, computedTax),
    nearlyEqual(totalNum, expectedTotal)
  ].every(Boolean);

  return {
    ok,
    details: {
      expectedSubtotal, dbSubtotal: subtotalNum, itemsSubtotal,
      deliveryFeeExpected: deliveryFee, deliveryFeeDB: feeNum,
      expectedTax: computedTax, dbTax: taxNum,
      expectedTotal, dbTotal: totalNum
    }
  };
}

async function main() {
  try {
    const email = 'test-verify@example.com';
    const password = 'password123';
    const { token, user } = await ensureAuth(email, password);

    const orderIdArg = process.argv[2];
    let orderId;
    let expectations;

    if (orderIdArg) {
      // Si proveen ID, solo traemos para verificar, pero no conocemos precios esperados; crearé uno nuevo si no hay contexto
      console.log('ID de pedido provisto, creando uno nuevo para tener expectativas de precios comparables...');
      const created = await createOrder(token);
      orderId = created.id;
      expectations = created;
    } else {
      const created = await createOrder(token);
      orderId = created.id;
      expectations = created;
    }

    const order = await fetchOrder(token, orderId);
    const result = verify(order, expectations);
    console.log('Verificación pedido', orderId, JSON.stringify(result.details, null, 2));

    if (!result.ok) {
      console.error('❌ Verificación falló');
      process.exit(1);
    }
    console.log('✅ Verificación OK');
    process.exit(0);
  } catch (e) {
    console.error('Test verify error:', e);
    process.exit(1);
  }
}

main();
