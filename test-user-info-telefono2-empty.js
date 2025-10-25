// Test: POST /api/v1/user-info/me with telefono2 omitted (should pass)
async function run() {
  const baseUrl = 'http://localhost:3000';
  const email = 'kelly@example.com';
  const password = 'password123';

  try {
    console.log('1) Doing login to get token...');
    const loginRes = await fetch(baseUrl + '/api/v1/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    console.log('   Login response:', loginData);
    if (!loginRes.ok || !loginData.ok) {
      console.error('Login failed');
      process.exit(1);
    }

    const token = loginData.token;

    console.log('\n2) Sending user-info without telefono2...');
    const cedula = String(Date.now()).slice(-9); // unique-ish numeric id
    const payload = {
      cedula,
      nombre: 'Prueba',
      apellidos: 'Telefono2Vacio',
      direccion: 'Calle 123',
      municipio: 'Tulua',
      departamento: 'Valle',
      telefono1: '3001234567'
      // telefono2 is intentionally omitted
    };

    const upsertRes = await fetch(baseUrl + '/api/v1/user-info/me', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    });
    const upsertData = await upsertRes.json();
    console.log('   Upsert response status:', upsertRes.status);
    console.log('   Upsert response body:', upsertData);

    if (upsertRes.ok && (upsertData.ok || upsertData.success)) {
      console.log('\n✅ Test passed: telefono2 omitted was accepted');
      process.exit(0);
    } else {
      console.error('\n❌ Test failed: backend rejected request');
      process.exit(2);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(3);
  }
}

run();
