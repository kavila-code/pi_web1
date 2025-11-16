import { db } from './connection.database.js';

async function analyzeProductRestaurantMatch() {
  try {
    const result = await db.query(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.category as product_category,
        p.restaurant_id,
        r.name as restaurant_name,
        r.category as restaurant_category
      FROM products p
      JOIN restaurants r ON p.restaurant_id = r.id
      ORDER BY r.category, r.name, p.category
    `);
    
    console.log(`\n=== ANÁLISIS PRODUCTO-RESTAURANTE (${result.rows.length}) ===\n`);
    
    let currentRestaurant = null;
    result.rows.forEach(row => {
      if (currentRestaurant !== row.restaurant_name) {
        currentRestaurant = row.restaurant_name;
        console.log(`\n${row.restaurant_category.toUpperCase()} - ${row.restaurant_name} (ID: ${row.restaurant_id})`);
      }
      console.log(`  └─ ${row.product_category}: ${row.product_name}`);
    });
    
    // Buscar posibles desajustes
    console.log('\n\n=== POSIBLES DESAJUSTES ===\n');
    const mismatches = result.rows.filter(row => {
      const restCat = row.restaurant_category.toLowerCase();
      const prodCat = row.product_category.toLowerCase();
      
      // Reglas de validación
      if (restCat.includes('pizza') || restCat.includes('italiana')) {
        return !prodCat.includes('pizza') && !prodCat.includes('pasta') && !prodCat.includes('entrada') && !prodCat.includes('bebida') && !prodCat.includes('pollo');
      }
      if (restCat.includes('hamburguesa') || restCat.includes('rápida')) {
        return !prodCat.includes('hamburguesa') && !prodCat.includes('acompañamiento') && !prodCat.includes('bebida') && !prodCat.includes('entrada');
      }
      if (restCat.includes('sushi') || restCat.includes('japonesa')) {
        return !prodCat.includes('sushi') && !prodCat.includes('rollo') && !prodCat.includes('sashimi') && !prodCat.includes('entrada') && !prodCat.includes('bebida');
      }
      if (restCat.includes('pollo')) {
        return !prodCat.includes('pollo') && !prodCat.includes('acompañamiento') && !prodCat.includes('bebida');
      }
      if (restCat.includes('postre') || restCat.includes('helad')) {
        return !prodCat.includes('postre') && !prodCat.includes('bebida');
      }
      
      return false;
    });
    
    if (mismatches.length > 0) {
      mismatches.forEach(m => {
        console.log(`⚠️  ${m.product_category}: "${m.product_name}" en ${m.restaurant_category}: "${m.restaurant_name}"`);
      });
    } else {
      console.log('✓ No se detectaron desajustes obvios');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

analyzeProductRestaurantMatch();
