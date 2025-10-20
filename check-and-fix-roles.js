import { db } from './database/connection.database.js';

async function checkAndFixRoles() {
  console.log('🔍 Verificando roles de los usuarios...\n');
  
  try {
    // Obtener todos los usuarios con sus roles
    const result = await db.query(`
      SELECT 
        u.uid, 
        u.email, 
        u.username,
        ARRAY_AGG(ur.role) FILTER (WHERE ur.is_active = true) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.uid = ur.user_id
      GROUP BY u.uid, u.email, u.username
      ORDER BY u.uid
    `);
    
    console.log('📋 Usuarios y sus roles actuales:\n');
    
    for (const user of result.rows) {
      console.log(`👤 ${user.email} (${user.username})`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Roles: ${user.roles ? user.roles.join(', ') : 'SIN ROLES'}`);
      console.log('');
    }
    
    // Verificar si test@test.com tiene rol admin
    const testUser = result.rows.find(u => u.email === 'test@test.com');
    
    if (testUser) {
      console.log('🔧 Configurando roles correctos...\n');
      
      if (!testUser.roles || !testUser.roles.includes('admin')) {
        console.log('   → Agregando rol "admin" a test@test.com');
        await db.query(
          'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO UPDATE SET is_active = true',
          [testUser.uid, 'admin']
        );
        console.log('   ✅ Rol admin agregado\n');
      } else {
        console.log('   ✅ test@test.com ya tiene rol admin\n');
      }
    }
    
    // Verificar Juan Fernando
    const juanUser = result.rows.find(u => u.email === 'juan@ramirez.com');
    
    if (juanUser) {
      const hasDelivery = juanUser.roles && (juanUser.roles.includes('delivery') || juanUser.roles.includes('domiciliario'));
      const hasUser = juanUser.roles && (juanUser.roles.includes('user') || juanUser.roles.includes('cliente'));
      
      if (!hasDelivery) {
        console.log('   → Agregando rol "delivery" a juan@ramirez.com');
        await db.query(
          'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO UPDATE SET is_active = true',
          [juanUser.uid, 'delivery']
        );
        console.log('   ✅ Rol delivery agregado');
      }
      
      if (!hasUser) {
        console.log('   → Agregando rol "user" a juan@ramirez.com');
        await db.query(
          'INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO UPDATE SET is_active = true',
          [juanUser.uid, 'user']
        );
        console.log('   ✅ Rol user agregado');
      }
      
      console.log('');
    }
    
    // Mostrar roles finales
    console.log('📊 Roles finales:\n');
    
    const finalResult = await db.query(`
      SELECT 
        u.uid, 
        u.email, 
        u.username,
        ARRAY_AGG(ur.role) FILTER (WHERE ur.is_active = true) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.uid = ur.user_id
      GROUP BY u.uid, u.email, u.username
      ORDER BY u.uid
    `);
    
    for (const user of finalResult.rows) {
      console.log(`✓ ${user.email}`);
      console.log(`  Roles: ${user.roles ? user.roles.join(', ') : 'SIN ROLES'}`);
      
      // Indicar a dónde se redirigirá
      const roles = user.roles || [];
      let redirect = '';
      if (roles.includes('admin')) {
        redirect = '→ Admin Dashboard';
      } else if (roles.includes('delivery') || roles.includes('domiciliario')) {
        redirect = '→ Delivery Dashboard';
      } else {
        redirect = '→ User Dashboard';
      }
      console.log(`  ${redirect}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

checkAndFixRoles();
