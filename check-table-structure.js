import { db } from './database/connection.database.js';

(async () => { 
  const result = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'user_roles' 
    ORDER BY ordinal_position
  `); 
  
  console.log('Columnas de user_roles:'); 
  result.rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`)); 
  process.exit(0); 
})();
