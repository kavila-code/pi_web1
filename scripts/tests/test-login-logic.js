// Test detallado del login con logs
import { UserModel } from './models/user.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function testLoginLogic() {
  console.log('🧪 Probando lógica de login paso a paso...\n');
  
  const email = 'kelly@example.com';
  const password = 'password123';
  
  try {
    // Paso 1: Buscar usuario
    console.log('1️⃣ Buscando usuario...');
    const user = await UserModel.findOneByEmailWithPassword(email);
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', {
      uid: user.uid,
      email: user.email,
      username: user.username,
      roles: user.roles,
      hasPassword: !!user.password
    });
    
    // Paso 2: Verificar password
    console.log('\n2️⃣ Verificando contraseña...');
    console.log('Password ingresada:', password);
    console.log('Hash en DB:', user.password.substring(0, 30) + '...');
    
    const isMatch = await bcryptjs.compare(password, user.password);
    console.log('¿Coincide?', isMatch);
    
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      console.log('\n💡 Intenta generar un nuevo hash:');
      const newHash = await bcryptjs.hash(password, 10);
      console.log('Nuevo hash generado:', newHash);
      console.log('\nActualiza en la DB con:');
      console.log(`UPDATE users SET password = '${newHash}' WHERE email = '${email}';`);
      return;
    }
    
    // Paso 3: Verificar roles
    console.log('\n3️⃣ Verificando roles...');
    console.log('Roles:', user.roles);
    console.log('Tipo:', typeof user.roles);
    console.log('¿Es array?', Array.isArray(user.roles));
    console.log('Length:', user.roles?.length);
    
    if (!user.roles || user.roles.length === 0) {
      console.log('⚠️ Usuario sin roles');
      return;
    }
    
    if (user.roles[0] === null) {
      console.log('⚠️ Rol es null - usuario no tiene roles activos');
      return;
    }
    
    // Paso 4: Generar token
    console.log('\n4️⃣ Generando token JWT...');
    console.log('JWT_SECRET existe?', !!process.env.JWT_SECRET);
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET no está definido en .env');
      return;
    }
    
    const token = jwt.sign(
      { uid: user.uid, email: user.email, roles: user.roles || ['user'] },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('✅ Token generado:', token.substring(0, 50) + '...');
    
    // Paso 5: Preparar respuesta
    console.log('\n5️⃣ Preparando respuesta...');
    const response = {
      ok: true,
      token,
      user: {
        uid: user.uid,
        email: user.email,
        username: user.username,
        roles: user.roles || ['user'],
        created_at: user.created_at
      }
    };
    
    console.log('✅ Respuesta completa:');
    console.log(JSON.stringify(response, null, 2));
    
    console.log('\n🎉 ¡Login exitoso!');
    
  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testLoginLogic();
