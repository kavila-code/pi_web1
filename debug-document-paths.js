// Debug de rutas de documentos
import 'dotenv/config';
import { db } from './database/connection.database.js';

async function debugDocumentPaths() {
  try {
    console.log('🔍 Analizando rutas de documentos en la base de datos...\n');
    
    const query = `
      SELECT 
        id,
        user_id,
        cv_file_path,
        id_document_path,
        license_photo_path,
        status
      FROM delivery_applications 
      WHERE cv_file_path IS NOT NULL 
         OR id_document_path IS NOT NULL 
         OR license_photo_path IS NOT NULL
      ORDER BY id DESC
      LIMIT 5
    `;
    
    const result = await db.query(query);
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontraron solicitudes con documentos');
      return;
    }
    
    console.log(`✅ Encontradas ${result.rows.length} solicitudes con documentos:\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`--- Solicitud ${index + 1} (ID: ${row.id}) ---`);
      console.log(`User ID: ${row.user_id}`);
      console.log(`Estado: ${row.status}`);
      
      if (row.cv_file_path) {
        console.log(`CV: ${row.cv_file_path}`);
        console.log(`CV URL: /uploads/delivery-applications/${row.cv_file_path.split('/').pop()}`);
      }
      
      if (row.id_document_path) {
        console.log(`ID Doc: ${row.id_document_path}`);
        console.log(`ID Doc URL: /uploads/delivery-applications/${row.id_document_path.split('/').pop()}`);
      }
      
      if (row.license_photo_path) {
        console.log(`Licencia: ${row.license_photo_path}`);
        console.log(`Licencia URL: /uploads/delivery-applications/${row.license_photo_path.split('/').pop()}`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.end();
  }
}

debugDocumentPaths();