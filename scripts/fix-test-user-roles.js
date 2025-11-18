// Script para asignar roles correctos a usuarios de prueba existentes
import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function fixTestUserRoles() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // 1. Delivery - asegurar que tiene rol delivery
    const deliveryEmail = 'delivery@test.com';
    const deliveryRes = await client.query('SELECT uid FROM users WHERE email = $1', [deliveryEmail]);
    
    if (deliveryRes.rows.length > 0) {
      const deliveryUid = deliveryRes.rows[0].uid;
      
      // Eliminar roles existentes
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [deliveryUid]);
      
      // Insertar roles correctos
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2), ($1, $3)',
        [deliveryUid, 'delivery', 'user']
      );
      
      console.log('✅ Roles actualizados para delivery@test.com:', deliveryUid, '- roles: delivery, user');
    } else {
      console.log('⚠️  delivery@test.com no existe');
    }

    // 2. Cliente - asegurar que tiene rol user
    const clienteEmail = 'cliente@test.com';
    const clienteRes = await client.query('SELECT uid FROM users WHERE email = $1', [clienteEmail]);
    
    if (clienteRes.rows.length > 0) {
      const clienteUid = clienteRes.rows[0].uid;
      
      // Eliminar roles existentes
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [clienteUid]);
      
      // Insertar rol correcto
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [clienteUid, 'user']
      );
      
      console.log('✅ Roles actualizados para cliente@test.com:', clienteUid, '- roles: user');
    } else {
      console.log('⚠️  cliente@test.com no existe');
    }

    // 3. Admin - asegurar que tiene rol admin
    const adminEmail = 'admin@test.com';
    const adminRes = await client.query('SELECT uid FROM users WHERE email = $1', [adminEmail]);
    
    if (adminRes.rows.length > 0) {
      const adminUid = adminRes.rows[0].uid;
      
      // Verificar si ya tiene el rol admin
      const rolesCheck = await client.query(
        'SELECT role FROM user_roles WHERE user_id = $1',
        [adminUid]
      );
      
      const hasAdmin = rolesCheck.rows.some(r => r.role === 'admin');
      
      if (!hasAdmin) {
        await client.query('DELETE FROM user_roles WHERE user_id = $1', [adminUid]);
        await client.query(
          'INSERT INTO user_roles (user_id, role) VALUES ($1, $2), ($1, $3)',
          [adminUid, 'admin', 'user']
        );
        console.log('✅ Roles actualizados para admin@test.com:', adminUid, '- roles: admin, user');
      } else {
        console.log('✓ admin@test.com ya tiene rol admin');
      }
    } else {
      console.log('⚠️  admin@test.com no existe');
    }

    console.log('\n✅ Roles de usuarios de prueba actualizados');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixTestUserRoles();
