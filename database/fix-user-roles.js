import { db } from './connection.database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixUserRolesTable() {
  try {
    console.log('🔧 Actualizando tabla user_roles...\n');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'fix_user_roles_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Ejecutar el script SQL
    const result = await db.query(sql);

    console.log('✅ Tabla user_roles actualizada exitosamente!\n');
    console.log('📊 Columnas actuales:');
    
    // Mostrar el resultado de la verificación
    if (result.rows && result.rows.length > 0) {
      result.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    } else {
      // Si no hay resultado, hacer una consulta manual
      const cols = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'user_roles'
        ORDER BY ordinal_position
      `);
      
      cols.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
    }

    console.log('\n🎉 ¡Listo! Ahora puedes intentar hacer login nuevamente.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar la tabla:', error);
    process.exit(1);
  }
}

fixUserRolesTable();
