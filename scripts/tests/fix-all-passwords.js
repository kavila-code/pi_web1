import { db } from './database/connection.database.js';
import bcryptjs from 'bcryptjs';

async function fixAllPasswords() {
  console.log('🔧 Actualizando contraseñas de TODOS los usuarios...\n');
  
  const defaultPassword = 'password123';
  
  try {
    // Generar hash una sola vez para todos
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(defaultPassword, salt);
    
    console.log('🔐 Password por defecto:', defaultPassword);
    console.log('🔑 Hash generado:', hashedPassword.substring(0, 30) + '...');
    console.log('');
    
    // Obtener todos los usuarios
    const users = await db.query('SELECT uid, email, username FROM users ORDER BY uid');
    
    console.log(`📋 Encontrados ${users.rows.length} usuarios\n`);
    
    // Actualizar todos a la vez
    await db.query('UPDATE users SET password = $1', [hashedPassword]);
    
    console.log('✅ Contraseñas actualizadas para todos los usuarios:\n');
    
    for (const user of users.rows) {
      console.log(`   ✓ UID ${user.uid}: ${user.email} (${user.username})`);
      
      // Verificar que funcionó
      const verify = await db.query('SELECT password FROM users WHERE uid = $1', [user.uid]);
      const match = await bcryptjs.compare(defaultPassword, verify.rows[0].password);
      console.log(`     Password funciona: ${match ? '✅' : '❌'}`);
    }
    
    console.log('\n🎉 ¡Listo! Todos los usuarios tienen la misma contraseña de prueba\n');
    console.log('📝 Credenciales de prueba:');
    console.log(`   Password: ${defaultPassword}`);
    console.log('');
    console.log('Usuarios disponibles:');
    users.rows.forEach(user => {
      console.log(`   - ${user.email}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

fixAllPasswords();
