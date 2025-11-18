// Script para crear usuarios de prueba con roles correctos
import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;
import bcryptjs from 'bcryptjs';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createTestUsers() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Hash de contraseña
    const passwordHash = await bcryptjs.hash('123456', 10);

    // 1. Admin
    const adminEmail = 'admin@test.com';
    const adminCheck = await client.query('SELECT uid FROM users WHERE email = $1', [adminEmail]);
    
    if (adminCheck.rows.length === 0) {
      const adminRes = await client.query(
        `INSERT INTO users (email, username, password, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING uid`,
        [adminEmail, 'Admin Test', passwordHash]
      );
      const adminUid = adminRes.rows[0].uid;
      
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2), ($1, $3)',
        [adminUid, 'admin', 'user']
      );
      
      console.log('✅ Admin creado:', adminEmail, '- UID:', adminUid);
    } else {
      console.log('✓ Admin ya existe:', adminEmail);
    }

    // 2. Delivery
    const deliveryEmail = 'delivery@test.com';
    const deliveryCheck = await client.query('SELECT uid FROM users WHERE email = $1', [deliveryEmail]);
    
    if (deliveryCheck.rows.length === 0) {
      const deliveryRes = await client.query(
        `INSERT INTO users (email, username, password, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING uid`,
        [deliveryEmail, 'Delivery Test', passwordHash]
      );
      const deliveryUid = deliveryRes.rows[0].uid;
      
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2), ($1, $3)',
        [deliveryUid, 'delivery', 'user']
      );
      
      console.log('✅ Delivery creado:', deliveryEmail, '- UID:', deliveryUid);
    } else {
      console.log('✓ Delivery ya existe:', deliveryEmail);
    }

    // 3. Cliente
    const clienteEmail = 'cliente@test.com';
    const clienteCheck = await client.query('SELECT uid FROM users WHERE email = $1', [clienteEmail]);
    
    if (clienteCheck.rows.length === 0) {
      const clienteRes = await client.query(
        `INSERT INTO users (email, username, password, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING uid`,
        [clienteEmail, 'Cliente Test', passwordHash]
      );
      const clienteUid = clienteRes.rows[0].uid;
      
      await client.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [clienteUid, 'user']
      );
      
      console.log('✅ Cliente creado:', clienteEmail, '- UID:', clienteUid);
    } else {
      console.log('✓ Cliente ya existe:', clienteEmail);
    }

    console.log('\n✅ Usuarios de prueba listos');
    console.log('Email: admin@test.com / delivery@test.com / cliente@test.com');
    console.log('Password: 123456');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTestUsers();
