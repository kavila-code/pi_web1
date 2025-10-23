import { db } from './database/connection.database.js';

async function standardizeRoles() {
  console.log('🔧 Estandarizando roles a inglés...\n');
  
  try {
    // Mostrar roles actuales
    const before = await db.query(`
      SELECT DISTINCT role FROM user_roles ORDER BY role
    `);
    
    console.log('📋 Roles actuales en la base de datos:');
    before.rows.forEach(r => console.log(`   - ${r.role}`));
    console.log('');
    
    // Cambiar "domiciliario" a "delivery"
    console.log('🔄 Cambiando "domiciliario" → "delivery"...');
    const result1 = await db.query(`
      UPDATE user_roles 
      SET role = 'delivery' 
      WHERE role = 'domiciliario'
      RETURNING *
    `);
    console.log(`   ✅ ${result1.rowCount} registros actualizados\n`);
    
    // Cambiar "cliente" a "user"
    console.log('🔄 Cambiando "cliente" → "user"...');
    const result2 = await db.query(`
      UPDATE user_roles 
      SET role = 'user' 
      WHERE role = 'cliente'
      RETURNING *
    `);
    console.log(`   ✅ ${result2.rowCount} registros actualizados\n`);
    
    // Mostrar roles después
    const after = await db.query(`
      SELECT DISTINCT role FROM user_roles ORDER BY role
    `);
    
    console.log('📊 Roles estandarizados:');
    after.rows.forEach(r => console.log(`   - ${r.role}`));
    console.log('');
    
    // Mostrar usuarios con sus nuevos roles
    const users = await db.query(`
      SELECT 
        u.uid, 
        u.email, 
        u.username,
        ARRAY_AGG(ur.role ORDER BY ur.role) FILTER (WHERE ur.is_active = true) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.uid = ur.user_id
      GROUP BY u.uid, u.email, u.username
      ORDER BY u.uid
    `);
    
    console.log('👥 Usuarios con roles actualizados:\n');
    
    for (const user of users.rows) {
      console.log(`✓ ${user.email}`);
      console.log(`  Roles: ${user.roles ? user.roles.join(', ') : 'SIN ROLES'}`);
      
      // Indicar dashboard
      const roles = user.roles || [];
      let dashboard = '';
      if (roles.includes('admin')) {
        dashboard = '→ Admin Dashboard';
      } else if (roles.includes('delivery')) {
        dashboard = '→ Delivery Dashboard';
      } else {
        dashboard = '→ User Dashboard';
      }
      console.log(`  ${dashboard}`);
      console.log('');
    }
    
    console.log('🎉 ¡Roles estandarizados correctamente!');
    console.log('\n💡 Ahora todos los roles están en inglés:');
    console.log('   - admin (administrador)');
    console.log('   - delivery (repartidor)');
    console.log('   - user (cliente)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

standardizeRoles();
