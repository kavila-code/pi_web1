// Test manual de login
async function testLogin() {
  const loginData = {
    email: 'kelly@example.com',
    password: 'password123' // Cambia esto por la contraseña correcta
  };

  console.log('🔐 Intentando hacer login...');
  console.log('Email:', loginData.email);

  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    console.log('\n📥 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log('\n✅ Login exitoso!');
      console.log('Token:', data.token);
      console.log('Usuario:', data.user);
      console.log('Roles:', data.user.roles);
    } else {
      console.log('\n❌ Login fallido:', data.msg);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testLogin();
