import { db } from './connection.database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createFavoritesTable() {
  try {
    console.log('📊 Creando tabla de favoritos...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'create_favorites_table.sql'),
      'utf8'
    );
    
    await db.query(sql);
    
    console.log('✅ Tabla de favoritos creada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando tabla de favoritos:', error);
    process.exit(1);
  }
}

createFavoritesTable();
