import { db } from './database/connection.database.js';
import { UserModel } from './models/user.model.js';

async function testLogin() {
  try {
    console.log('🔍 Verificando configuración de base de datos...\n');

    // 1. Verificar si existe la tabla user_roles
    console.log('1️⃣ Verificando tabla user_roles...');
    try {
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_roles'
        );
      `);
      
      if (tableCheck.rows[0].exists) {
        console.log('   ✅ Tabla user_roles existe\n');
      } else {
        console.log('   ❌ Tabla user_roles NO existe');
        console.log('   ⚠️  Debes ejecutar: node database/migrate-user-roles.js\n');
        process.exit(1);
      }
    } catch (error) {
      console.log('   ❌ Error verificando tabla:', error.message, '\n');
      process.exit(1);
    }

    // 2. Verificar estructura de la tabla users
    console.log('2️⃣ Verificando columnas de tabla users...');
    const columns = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('   Columnas:', columns.rows.map(r => r.column_name).join(', '));
    
    const hasRoleColumn = columns.rows.some(r => r.column_name === 'role');
    if (hasRoleColumn) {
      console.log('   ⚠️  La tabla users AÚN tiene la columna "role"');
      console.log('   💡 Debes eliminarla: ALTER TABLE users DROP COLUMN role;\n');
    } else {
      console.log('   ✅ La columna "role" ha sido eliminada correctamente\n');
    }

    // 3. Verificar usuarios existentes
    console.log('3️⃣ Verificando usuarios...');
    const users = await db.query('SELECT uid, email FROM users LIMIT 5');
    console.log(`   Total de usuarios (muestra): ${users.rows.length}`);
    
    if (users.rows.length > 0) {
      console.log('   Usuarios encontrados:');
      for (const user of users.rows) {
        console.log(`   - uid: ${user.uid}, email: ${user.email}`);
      }
      console.log('');
    } else {
      console.log('   ℹ️  No hay usuarios en la base de datos\n');
    }

    // 4. Verificar roles asignados
    console.log('4️⃣ Verificando roles asignados...');
    const rolesCount = await db.query(`
      SELECT 
        COUNT(DISTINCT user_id) as users_with_roles,
        COUNT(*) as total_role_assignments
      FROM user_roles
    `);
    
    console.log(`   Usuarios con roles: ${rolesCount.rows[0].users_with_roles}`);
    console.log(`   Total de asignaciones: ${rolesCount.rows[0].total_role_assignments}\n`);

    // 5. Verificar usuarios sin roles
    console.log('5️⃣ Verificando usuarios sin roles...');
    const usersWithoutRoles = await db.query(`
      SELECT u.uid, u.email 
      FROM users u
      LEFT JOIN user_roles ur ON u.uid = ur.user_id AND ur.is_active = true
      WHERE ur.user_id IS NULL
      LIMIT 5
    `);
    
    if (usersWithoutRoles.rows.length > 0) {
      console.log(`   ⚠️  ${usersWithoutRoles.rows.length} usuarios SIN roles asignados:`);
      for (const user of usersWithoutRoles.rows) {
        console.log(`   - uid: ${user.uid}, email: ${user.email}`);
      }
      console.log('\n   💡 Solución: Ejecutar el script de migración o asignar roles manualmente\n');
    } else {
      console.log('   ✅ Todos los usuarios tienen roles asignados\n');
    }

    // 6. Probar el método de login
    if (users.rows.length > 0) {
      console.log('6️⃣ Probando método findOneByEmailWithPassword...');
      const testEmail = users.rows[0].email;
      console.log(`   Probando con email: ${testEmail}`);
      
      try {
        const user = await UserModel.findOneByEmailWithPassword(testEmail);
        console.log('   ✅ Método ejecutado correctamente');
        console.log('   Resultado:', JSON.stringify(user, null, 2), '\n');
        
        if (!user.roles || user.roles.length === 0 || user.roles[0] === null) {
          console.log('   ⚠️  Usuario sin roles asignados!');
          console.log('   💡 Ejecuta: INSERT INTO user_roles (user_id, role) VALUES (' + user.uid + ", 'user');\n");
        }
      } catch (error) {
        console.log('   ❌ Error al ejecutar método:', error.message);
        console.log('   Stack:', error.stack, '\n');
      }
    }

    console.log('✅ Diagnóstico completado\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    process.exit(1);
  }
}

testLogin();
