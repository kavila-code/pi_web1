// Script para probar el endpoint de usuarios del admin

async function testAdminUsers() {
  try {
    // Primero hacer login como admin
    console.log('🔐 Iniciando sesión como admin...');
    const loginResponse = await fetch('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.token) {
      console.error('❌ Error al hacer login:', loginData);
      return;
    }

    console.log('✅ Login exitoso');
    const token = loginData.token;

    // Ahora obtener los usuarios
    console.log('\n📋 Obteniendo lista de usuarios...');
    const usersResponse = await fetch('http://localhost:3000/api/v1/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const usersData = await usersResponse.json();
    
    console.log('\n📊 Respuesta del servidor:');
    console.log('Status:', usersResponse.status);
    console.log('OK:', usersData.ok);
    console.log('Total usuarios:', usersData.total);
    
    if (usersData.users) {
      console.log('\n👥 Lista de usuarios recibidos:');
      console.log('ID | Username | Email | Nombre | Roles');
      console.log(''.padEnd(100, '-'));
      
      usersData.users.forEach(user => {
        const nombre = user.nombre && user.apellidos 
          ? `${user.nombre} ${user.apellidos}` 
          : 'N/A';
        const roles = (user.roles || []).join(', ') || 'sin roles';
        console.log(`${user.id} | ${user.username} | ${user.email} | ${nombre} | ${roles}`);
      });
      
      console.log('\n✅ Total usuarios mostrados:', usersData.users.length);
    } else {
      console.error('❌ No se recibió la lista de usuarios');
      console.log('Respuesta completa:', JSON.stringify(usersData, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminUsers();
