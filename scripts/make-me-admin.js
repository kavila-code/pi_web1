// Script para hacer admin al usuario logueado actualmente
import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (q) => new Promise((resolve) => rl.question(q, resolve));

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function makeAdmin() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    const email = await question('Ingresa tu email: ');
    
    if (!email) {
      console.log('❌ Email requerido');
      process.exit(1);
    }

    // Buscar usuario
    const userRes = await client.query(
      'SELECT uid, username, email FROM users WHERE email = $1',
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      console.log(`❌ Usuario ${email} no encontrado`);
      process.exit(1);
    }

    const user = userRes.rows[0];
    console.log(`\n✅ Usuario encontrado:`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);

    // Ver roles actuales
    const rolesRes = await client.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [user.uid]
    );

    const currentRoles = rolesRes.rows.map(r => r.role);
    console.log(`   Roles actuales: ${currentRoles.join(', ') || 'ninguno'}`);

    if (currentRoles.includes('admin')) {
      console.log('\n✓ Este usuario ya es admin');
      process.exit(0);
    }

    // Agregar rol admin
    await client.query(
      `INSERT INTO user_roles (user_id, role) 
       VALUES ($1, 'admin') 
       ON CONFLICT (user_id, role) DO NOTHING`,
      [user.uid]
    );

    console.log('\n✅ Rol admin agregado exitosamente');
    console.log('   Ahora tienes acceso al panel de administración');
    console.log('   Recarga la página para ver los cambios');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    rl.close();
  }
}

makeAdmin();
