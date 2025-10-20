import { db } from './connection.database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración del sistema de roles...\n');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create_user_roles_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Ejecutar el script SQL
    await db.query(sql);

    console.log('✅ Migración completada exitosamente!\n');
    console.log('📊 Cambios realizados:');
    console.log('   - Tabla user_roles creada');
    console.log('   - Índices creados para mejor rendimiento');
    console.log('   - Roles por defecto asignados a usuarios existentes');
    
    // Verificar la migración
    const result = await db.query(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_roles
      FROM user_roles
    `);
    
    console.log('\n📈 Estadísticas:');
    console.log(`   - Usuarios con roles: ${result.rows[0].total_users}`);
    console.log(`   - Total de asignaciones de roles: ${result.rows[0].total_roles}`);
    console.log('\n🎉 ¡Sistema de roles múltiples listo para usar!');
    console.log('\n📝 Consulta MIGRATION_GUIDE_ROLES.md para más información');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar la migración:', error);
    process.exit(1);
  }
}

runMigration();
