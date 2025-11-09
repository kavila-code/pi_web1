import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  allowExitOnIdle: true
});

async function runMigration() {
  try {
    console.log('🔧 Iniciando migración de base de datos...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'database', 'fix_user_roles_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Ejecutar el script SQL
    await pool.query(sql);
    
    console.log('✅ Migración completada exitosamente');
    console.log('✅ Columna is_active agregada a la tabla user_roles');
    
    // Verificar la estructura
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_roles'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura actual de la tabla user_roles:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
