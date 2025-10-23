import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function testUserInfoRelationship() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // 1. Mostrar usuario existente en users
    console.log('📋 PASO 1: Usuario existente en tabla "users"');
    console.log('─'.repeat(80));
    const user = await client.query(`
      SELECT uid, email, username 
      FROM users 
      WHERE uid = 2
    `);
    
    if (user.rows.length === 0) {
      console.log('❌ No se encontró el usuario con uid=2');
      await client.end();
      return;
    }

    console.log(`  UID: ${user.rows[0].uid}`);
    console.log(`  Email: ${user.rows[0].email}`);
    console.log(`  Username: ${user.rows[0].username}`);

    // 2. Insertar información adicional en user_info
    console.log('\n📝 PASO 2: Usuario completa su información adicional');
    console.log('─'.repeat(80));
    
    const insertResult = await client.query(`
      INSERT INTO user_info (
        uid, 
        cedula, 
        nombres, 
        apellidos, 
        direccion, 
        municipio, 
        departamento, 
        telefono1, 
        telefono2
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      ON CONFLICT (uid) DO UPDATE SET
        cedula = EXCLUDED.cedula,
        nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        direccion = EXCLUDED.direccion,
        municipio = EXCLUDED.municipio,
        departamento = EXCLUDED.departamento,
        telefono1 = EXCLUDED.telefono1,
        telefono2 = EXCLUDED.telefono2,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      2, // uid del usuario kelly@example.com
      '1234567890', // cédula
      'Kelly', // nombres
      'Ramírez González', // apellidos
      'Calle 15 #10-25', // dirección
      'Tuluá', // municipio
      'Valle del Cauca', // departamento
      '3001234567', // teléfono1
      '3157654321' // teléfono2
    ]);

    console.log('✅ Información adicional insertada:');
    console.log(`  Cédula: ${insertResult.rows[0].cedula}`);
    console.log(`  Nombres: ${insertResult.rows[0].nombres}`);
    console.log(`  Apellidos: ${insertResult.rows[0].apellidos}`);
    console.log(`  Dirección: ${insertResult.rows[0].direccion}`);
    console.log(`  Municipio: ${insertResult.rows[0].municipio}`);
    console.log(`  Departamento: ${insertResult.rows[0].departamento}`);
    console.log(`  Teléfono 1: ${insertResult.rows[0].telefono1}`);
    console.log(`  Teléfono 2: ${insertResult.rows[0].telefono2}`);

    // 3. Hacer JOIN para mostrar que son EL MISMO usuario
    console.log('\n🔗 PASO 3: Consulta con JOIN - Información COMPLETA del usuario');
    console.log('─'.repeat(80));
    
    const fullInfo = await client.query(`
      SELECT 
        u.uid,
        u.email,
        u.username,
        ui.cedula,
        ui.nombres,
        ui.apellidos,
        ui.direccion,
        ui.municipio,
        ui.departamento,
        ui.telefono1,
        ui.telefono2
      FROM users u
      INNER JOIN user_info ui ON u.uid = ui.uid
      WHERE u.uid = 2
    `);

    console.log('✅ INFORMACIÓN COMPLETA DEL MISMO USUARIO:');
    console.log('');
    console.log('  📧 Datos de autenticación (tabla users):');
    console.log(`     - UID: ${fullInfo.rows[0].uid}`);
    console.log(`     - Email: ${fullInfo.rows[0].email}`);
    console.log(`     - Username: ${fullInfo.rows[0].username}`);
    console.log('');
    console.log('  📋 Información adicional (tabla user_info):');
    console.log(`     - Cédula: ${fullInfo.rows[0].cedula}`);
    console.log(`     - Nombres: ${fullInfo.rows[0].nombres}`);
    console.log(`     - Apellidos: ${fullInfo.rows[0].apellidos}`);
    console.log(`     - Dirección: ${fullInfo.rows[0].direccion}`);
    console.log(`     - Municipio: ${fullInfo.rows[0].municipio}`);
    console.log(`     - Departamento: ${fullInfo.rows[0].departamento}`);
    console.log(`     - Teléfono 1: ${fullInfo.rows[0].telefono1}`);
    console.log(`     - Teléfono 2: ${fullInfo.rows[0].telefono2}`);

    // 4. Mostrar resumen
    console.log('\n💡 EXPLICACIÓN:');
    console.log('─'.repeat(80));
    console.log('✅ El usuario kelly@example.com (UID=2) es EL MISMO en ambas tablas');
    console.log('✅ La columna "uid" es la que los RELACIONA (FOREIGN KEY)');
    console.log('✅ Cuando el usuario inserta información, se guarda con su mismo UID');
    console.log('✅ Puedes consultar toda su información haciendo un JOIN');
    console.log('');
    console.log('🔗 Relación: users.uid = user_info.uid');

    // Contar usuarios con y sin info adicional
    console.log('\n📊 RESUMEN DE TODOS LOS USUARIOS:');
    console.log('─'.repeat(80));
    
    const summary = await client.query(`
      SELECT 
        u.uid,
        u.email,
        CASE 
          WHEN ui.uid IS NOT NULL THEN '✅ Tiene info adicional'
          ELSE '❌ Sin info adicional'
        END as status
      FROM users u
      LEFT JOIN user_info ui ON u.uid = ui.uid
      ORDER BY u.uid
    `);

    summary.rows.forEach(row => {
      console.log(`  UID ${row.uid}: ${row.email.padEnd(25)} ${row.status}`);
    });

    await client.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

testUserInfoRelationship();
