import { db } from './database/connection.database.js';
import bcryptjs from 'bcryptjs';

async function resetUserPasswords() {
  console.log('🔐 Configurando contraseñas de prueba...\n');
  
  const defaultPassword = 'password123';
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(defaultPassword, salt);
  
  console.log('Password por defecto:', defaultPassword);
  console.log('Hash generado:', hashedPassword);
  console.log('');
  
  try {
    // Obtener todos los usuarios
    const result = await db.query('SELECT uid, email, username FROM users');
    const users = result.rows;
    
    console.log(`Encontrados ${users.length} usuarios:\n`);
    
    for (const user of users) {
      console.log(`📧 ${user.email} (${user.username})`);
      console.log(`   UID: ${user.uid}`);
      
      // Preguntar si quiere actualizar
      console.log(`   → Actualizando password a: ${defaultPassword}`);
      
      await db.query(
        'UPDATE users SET password = $1 WHERE uid = $2',
        [hashedPassword, user.uid]
      );
      
      console.log(`   ✅ Actualizado\n`);
    }
    
    console.log('✅ Todos los usuarios ahora tienen la contraseña:', defaultPassword);
    console.log('\n🧪 Puedes probar el login con cualquiera de estos usuarios:\n');
    
    users.forEach(user => {
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${defaultPassword}\n`);
    });
    
    console.log('🎯 Prueba ahora hacer login desde el navegador o con:');
    console.log(`   POST http://localhost:3000/api/v1/users/login`);
    console.log(`   Body: {"email":"${users[0]?.email}","password":"${defaultPassword}"}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

resetUserPasswords();
