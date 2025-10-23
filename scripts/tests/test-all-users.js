// Probar login con todos los usuarios
import http from 'http';

const users = [
  { email: 'test@test.com', password: 'password123' },
  { email: 'kelly@example.com', password: 'password123' },
  { email: 'juan@ramirez.com', password: 'password123' }
];

async function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testAllUsers() {
  console.log('🧪 Probando login con todos los usuarios...\n');
  
  for (const user of users) {
    console.log(`📧 Testing: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    
    try {
      const result = await testLogin(user.email, user.password);
      
      console.log(`   Status: ${result.status}`);
      
      if (result.data.ok) {
        console.log('   ✅ LOGIN EXITOSO');
        console.log(`   Usuario: ${result.data.user.username}`);
        console.log(`   Roles: ${result.data.user.roles.join(', ')}`);
        console.log(`   Token: ${result.data.token.substring(0, 40)}...`);
      } else {
        console.log(`   ❌ FALLÓ: ${result.data.msg}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎉 Pruebas completadas');
  process.exit(0);
}

testAllUsers();
