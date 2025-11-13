import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:0330@localhost:5432/jwt_db'
});

async function checkUsers() {
  try {
    // Verificar estructura de tabla users
    const structureResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estructura de tabla users:');
    structureResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Contar usuarios totales
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log('\n📊 Total de usuarios en la base de datos:', countResult.rows[0].count);
    
    // Obtener todos los usuarios con sus detalles (usando uid en lugar de id)
    const usersResult = await pool.query(`
      SELECT 
        u.uid,
        u.username,
        u.email,
        u.created_at,
        ud.nombre,
        ud.apellidos
      FROM users u
      LEFT JOIN user_details ud ON u.uid = ud.user_id
      ORDER BY u.uid
    `);
    
    console.log('\n👥 Lista de usuarios:');
    console.log('UID | Username | Email | Nombre | Fecha Creación');
    console.log(''.padEnd(80, '-'));
    
    usersResult.rows.forEach(user => {
      const fecha = new Date(user.created_at).toLocaleDateString('es-ES');
      const nombre = user.nombre && user.apellidos ? `${user.nombre} ${user.apellidos}` : 'N/A';
      console.log(`${user.uid} | ${user.username} | ${user.email} | ${nombre} | ${fecha}`);
    });
    
    // Verificar roles de cada usuario
    console.log('\n🔐 Roles por usuario:');
    for (const user of usersResult.rows) {
      const rolesResult = await pool.query(
        'SELECT role FROM user_roles WHERE user_id = $1',
        [user.uid]
      );
      const roles = rolesResult.rows.map(r => r.role).join(', ') || 'sin roles';
      console.log(`Usuario ${user.uid} (${user.username}): ${roles}`);
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkUsers();
