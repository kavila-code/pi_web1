import { db } from './connection.database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migración de base de datos...\n');

    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'create_orders_schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Ejecutar el script SQL
    await db.query(sql);

    console.log('✅ Migración completada exitosamente!\n');
    console.log('📊 Tablas creadas:');
    console.log('   - restaurants');
    console.log('   - products');
    console.log('   - orders');
    console.log('   - order_items');
    console.log('   - order_status_history');
    console.log('\n🎉 ¡Base de datos lista para usar!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar la migración:', error);
    process.exit(1);
  }
}

runMigrations();
