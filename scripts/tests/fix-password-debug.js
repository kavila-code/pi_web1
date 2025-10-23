import { db } from './database/connection.database.js';
import bcryptjs from 'bcryptjs';

async function checkAndFixPassword() {
  console.log('🔍 Verificando contraseñas en la base de datos...\n');
  
  const email = 'kelly@example.com';
  const testPassword = 'password123';
  
  try {
    // Obtener usuario
    const result = await db.query('SELECT uid, email, username, password FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    const user = result.rows[0];
    console.log('Usuario encontrado:');
    console.log('  UID:', user.uid);
    console.log('  Email:', user.email);
    console.log('  Username:', user.username);
    console.log('  Password Hash:', user.password);
    console.log('');
    
    // Probar si la contraseña actual funciona
    console.log(`🔐 Probando contraseña: "${testPassword}"`);
    const isMatch = await bcryptjs.compare(testPassword, user.password);
    console.log('¿Coincide?', isMatch ? '✅ SÍ' : '❌ NO');
    console.log('');
    
    if (!isMatch) {
      console.log('🔧 Generando nuevo hash...');
      const salt = await bcryptjs.genSalt(10);
      const newHash = await bcryptjs.hash(testPassword, salt);
      console.log('Nuevo hash:', newHash);
      console.log('');
      
      console.log('📝 Actualizando en la base de datos...');
      await db.query('UPDATE users SET password = $1 WHERE uid = $2', [newHash, user.uid]);
      console.log('✅ Password actualizado correctamente');
      console.log('');
      
      // Verificar que funcionó
      console.log('✓ Verificando actualización...');
      const verifyResult = await db.query('SELECT password FROM users WHERE uid = $1', [user.uid]);
      const verifyMatch = await bcryptjs.compare(testPassword, verifyResult.rows[0].password);
      console.log('¿Funciona ahora?', verifyMatch ? '✅ SÍ' : '❌ NO');
    }
    
    console.log('\n🎯 Credenciales de prueba:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${testPassword}`);
    console.log('\n💡 Ahora intenta hacer login nuevamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
}

checkAndFixPassword();
