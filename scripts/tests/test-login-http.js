import http from 'http';

const data = JSON.stringify({
  email: 'kelly@example.com',
  password: 'password123'
});

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

console.log('🧪 Probando login con http nativo...\n');
console.log('Options:', options);
console.log('Data:', data);
console.log('');

const req = http.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  console.log(`📡 Headers:`, res.headers);
  console.log('');

  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response body:');
    try {
      const jsonResponse = JSON.parse(body);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      if (jsonResponse.ok) {
        console.log('\n✅ ¡LOGIN EXITOSO!');
      } else {
        console.log('\n❌ Login fallido:', jsonResponse.msg);
      }
    } catch (e) {
      console.log(body);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
