// Actualizar rutas existentes en la base de datos
import 'dotenv/config';
import { db } from './database/connection.database.js';

async function fixExistingPaths() {
  try {
    console.log('🔧 Corrigiendo rutas existentes en la base de datos...\n');
    
    // Obtener todas las solicitudes con rutas completas
    const selectQuery = `
      SELECT 
        id,
        cv_file_path,
        id_document_path,
        license_photo_path
      FROM delivery_applications 
      WHERE cv_file_path IS NOT NULL 
         OR id_document_path IS NOT NULL 
         OR license_photo_path IS NOT NULL
    `;
    
    const result = await db.query(selectQuery);
    
    console.log(`📋 Encontradas ${result.rows.length} solicitudes para corregir:`);
    
    for (const row of result.rows) {
      const updates = {};
      let hasUpdates = false;
      
      // Extraer nombres de archivo de rutas completas
      if (row.cv_file_path && row.cv_file_path.includes('\\')) {
        updates.cv_file_path = row.cv_file_path.split('\\').pop();
        hasUpdates = true;
        console.log(`CV: ${row.cv_file_path} -> ${updates.cv_file_path}`);
      }
      
      if (row.id_document_path && row.id_document_path.includes('\\')) {
        updates.id_document_path = row.id_document_path.split('\\').pop();
        hasUpdates = true;
        console.log(`ID: ${row.id_document_path} -> ${updates.id_document_path}`);
      }
      
      if (row.license_photo_path && row.license_photo_path.includes('\\')) {
        updates.license_photo_path = row.license_photo_path.split('\\').pop();
        hasUpdates = true;
        console.log(`Licencia: ${row.license_photo_path} -> ${updates.license_photo_path}`);
      }
      
      // Actualizar solo si hay cambios
      if (hasUpdates) {
        let updateQuery = 'UPDATE delivery_applications SET ';
        const updateFields = [];
        const values = [];
        let paramIndex = 1;
        
        Object.entries(updates).forEach(([field, value]) => {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        });
        
        updateQuery += updateFields.join(', ') + ` WHERE id = $${paramIndex}`;
        values.push(row.id);
        
        await db.query(updateQuery, values);
        console.log(`✅ Actualizada solicitud ID: ${row.id}`);
      }
    }
    
    console.log('\n🎉 Todas las rutas han sido corregidas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.end();
  }
}

fixExistingPaths();