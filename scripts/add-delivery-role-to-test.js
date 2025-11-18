import { db } from '../database/connection.database.js';

async function addDeliveryRole() {
  try {
    console.log('🔍 Buscando usuario test@test.com...');
    
    // Obtener el usuario actual
    const userResult = await db.query(
      'SELECT uid, email FROM users WHERE email = $1',
      ['test@test.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario test@test.com no encontrado');
      process.exit(1);
    }
    
    const user = userResult.rows[0];
    console.log('✅ Usuario encontrado:', user);
    
    // Verificar roles actuales
    const rolesResult = await db.query(
      'SELECT role, is_active FROM user_roles WHERE user_id = $1',
      [user.uid]
    );
    
    console.log('📋 Roles actuales:', rolesResult.rows);
    
    // Verificar si ya tiene el rol delivery
    const hasDeliveryRole = rolesResult.rows.some(r => r.role === 'delivery');
    
    if (hasDeliveryRole) {
      console.log('ℹ️ El usuario ya tiene el rol "delivery"');
    } else {
      // Agregar el rol delivery
      await db.query(
        'INSERT INTO user_roles (user_id, role, is_active, assigned_at) VALUES ($1, $2, $3, NOW())',
        [user.uid, 'delivery', true]
      );
      
      console.log('✅ Rol "delivery" agregado exitosamente');
    }
    
    // Verificar el resultado
    const updatedRoles = await db.query(
      'SELECT role, is_active, assigned_at FROM user_roles WHERE user_id = $1',
      [user.uid]
    );
    
    console.log('\n📊 Roles actualizados:');
    console.table(updatedRoles.rows);
    console.log('\n✅ Proceso completado. Ahora cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDeliveryRole();
