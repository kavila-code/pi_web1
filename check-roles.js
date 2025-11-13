import { db } from './database/connection.database.js';

async function checkRoles() {
  try {
    // Ver todos los roles únicos
    const rolesResult = await db.query('SELECT DISTINCT role FROM user_roles ORDER BY role');
    console.log('📋 Roles únicos en user_roles:');
    rolesResult.rows.forEach(row => {
      console.log(`  - "${row.role}"`);
    });

    // Ver usuarios con rol domiciliario
    const deliveryUsersResult = await db.query(`
      SELECT u.uid, u.username, u.email, ur.role 
      FROM users u 
      JOIN user_roles ur ON u.uid = ur.user_id 
      WHERE ur.role LIKE '%domicil%'
    `);
    console.log('\n👤 Usuarios con rol de domiciliario:');
    deliveryUsersResult.rows.forEach(user => {
      console.log(`  - ID: ${user.uid}, Username: ${user.username}, Role: "${user.role}"`);
    });

    // Ver todos los roles por usuario
    const allRolesResult = await db.query(`
      SELECT u.uid, u.username, STRING_AGG(ur.role, ', ') as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.uid = ur.user_id
      GROUP BY u.uid, u.username
      ORDER BY u.uid
    `);
    console.log('\n📊 Todos los usuarios y sus roles:');
    allRolesResult.rows.forEach(user => {
      console.log(`  - ID: ${user.uid}, Username: ${user.username}, Roles: "${user.roles || 'sin roles'}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRoles();
