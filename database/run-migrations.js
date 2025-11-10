import { db } from './connection.database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migración de base de datos...\n');

    // Ejecutar todos los archivos .sql en la carpeta `database` en orden alfabético.
    // Esto asegura que todas las migraciones (incluyendo delivery_applications.sql)
    // se apliquen cuando se ejecute este script.
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️ No se encontraron archivos .sql en la carpeta de migraciones.');
    }

    for (const file of files) {
      const filePath = path.join(__dirname, file);
      console.log(`➡️ Ejecutando ${file} ...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      // Ejecutar cada statement; algunos archivos contienen múltiples sentencias.
      await db.query(sql);
      console.log(`   ✅ ${file} aplicado`);
    }

    console.log('\n✅ Todas las migraciones .sql fueron ejecutadas exitosamente!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar la migración:', error);
    process.exit(1);
  }
}

runMigrations();
