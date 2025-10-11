// Script para actualizar la base de datos con los nuevos campos
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateDatabase() {
  try {
    console.log('🔄 Iniciando actualización de la base de datos...');
    
    // Leer el archivo SQL de actualización
    const sqlFile = path.join(__dirname, 'database', 'update_delivery_applications.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Ejecutar las actualizaciones
    await pool.query(sql);
    
    console.log('✅ Base de datos actualizada exitosamente');
    console.log('📋 Nuevos campos agregados:');
    console.log('   - Información personal completa');
    console.log('   - Datos de vehículo y licencia');
    console.log('   - Horarios de disponibilidad');
    console.log('   - Experiencia y motivación');
    console.log('   - Soporte para archivos adjuntos');
    
    // Verificar la estructura actualizada
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'delivery_applications'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📊 Estructura actual de la tabla:');
    result.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('column already exists')) {
      console.log('ℹ️  Las columnas ya existen en la base de datos');
    } else {
      console.error('❌ Error actualizando la base de datos:', error.message);
    }
  } finally {
    await pool.end();
  }
}

updateDatabase();