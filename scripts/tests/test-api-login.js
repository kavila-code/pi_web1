// Test final de login via API
async function testRealLogin() {
  console.log('🧪 Probando login via API HTTP...\n');
  
  const loginData = {
    email: 'kelly@example.com',
    password: 'password123'
  };
  
  console.log('URL: http://localhost:3000/api/v1/users/login');
  console.log('Body:', JSON.stringify(loginData, null, 2));
  console.log('');
  
  try {
    const response = await fetch('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);
    console.log('');

    const data = await response.json();
    console.log('📥 Respuesta:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.ok) {
      console.log('\n✅ ¡LOGIN EXITOSO!');
      console.log('\n📋 Información del usuario:');
      console.log('   Email:', data.user.email);
      console.log('   Username:', data.user.username);
      console.log('   Roles:', data.user.roles.join(', '));
      console.log('\n🔑 Token (primeros 50 caracteres):');
      console.log('   ', data.token.substring(0, 50) + '...');
    } else {
      console.log('\n❌ Login fallido:', data.msg);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
  
  process.exit(0);
}

testRealLogin();
