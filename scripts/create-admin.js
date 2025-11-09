import 'dotenv/config';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL, allowExitOnIdle: true });

// Configurables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const JWT_EXPIRES = '7d';

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user exists
    const { rows: existing } = await client.query('SELECT uid, email FROM users WHERE email = $1', [ADMIN_EMAIL]);

    let uid;
    if (existing.length > 0) {
      uid = existing[0].uid;
      console.log(`Usuario ya existe: uid=${uid}, email=${existing[0].email}`);
      // Update password to known value (useful for pruebas)
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      await client.query('UPDATE users SET password = $1 WHERE uid = $2', [hash, uid]);
      console.log('Contraseña actualizada para el usuario existente.');
    } else {
      // Crear nuevo usuario
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      const insertUser = await client.query(
        `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING uid, email`,
        [ADMIN_USERNAME, ADMIN_EMAIL, hash]
      );
      uid = insertUser.rows[0].uid;
      console.log(`Usuario creado: uid=${uid}, email=${insertUser.rows[0].email}`);
    }

    // Assign admin role (activate if exists)
    await client.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT (user_id, role) DO UPDATE SET is_active = true, assigned_at = CURRENT_TIMESTAMP`,
      [uid]
    );

    await client.query('COMMIT');

    // Generar token JWT para pruebas
    const rolesRes = await client.query('SELECT role FROM user_roles WHERE user_id = $1 AND is_active = true', [uid]);
    const roles = rolesRes.rows.map(r => r.role) || ['user'];

    const token = jwt.sign({ uid, email: ADMIN_EMAIL, roles }, process.env.JWT_SECRET || 'dev_jwt_secret', { expiresIn: JWT_EXPIRES });

    console.log('\n✅ Admin listo para pruebas');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('UID:', uid);
    console.log('\nToken JWT (ponlo en Authorization: Bearer <token>):\n');
    console.log(token);
    console.log('\n-- Usa este token para llamar endpoints protegidos, por ejemplo:');
    console.log("curl -H \"Authorization: Bearer <token>\" http://localhost:3000/api/v1/admin/dashboard/stats");

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creando admin:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
