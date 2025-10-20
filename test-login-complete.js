// Test de login con logs detallados
import bcryptjs from 'bcryptjs';

async function testLoginFlow() {
  const testEmail = 'kelly@example.com';
  const testPassword = 'password123'; // Cambia esto por la contraseña correcta
  
  console.log('🧪 Probando flujo completo de login...\n');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
  
  try {
    const response = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    console.log('\n📡 Status HTTP:', response.status);
    
    const data = await response.json();
    console.log('\n📥 Respuesta completa:');
    console.log(JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log('\n✅ Login exitoso!');
      console.log('Token generado:', data.token.substring(0, 50) + '...');
      console.log('Roles del usuario:', data.user.roles);
    } else {
      console.log('\n❌ Login fallido');
      console.log('Mensaje:', data.msg);
    }

  } catch (error) {
    console.error('\n❌ Error en la petición:', error.message);
    console.error('Stack:', error.stack);
  }
}

// También probar directamente el modelo
import { UserModel } from './models/user.model.js';

async function testModel() {
  console.log('\n\n🔍 Probando modelo directamente...\n');
  
  try {
    const user = await UserModel.findOneByEmailWithPassword('kelly@example.com');
    console.log('Usuario encontrado:', user);
    
    if (user && user.roles) {
      console.log('\n✅ Usuario tiene roles:', user.roles);
      console.log('¿Es array?', Array.isArray(user.roles));
      console.log('¿Tiene valores null?', user.roles.includes(null));
    }
    
  } catch (error) {
    console.error('❌ Error en modelo:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar ambos tests
(async () => {
  await testLoginFlow();
  await testModel();
  process.exit(0);
})();
