import { db } from './connection.database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateRestaurantLogos() {
  try {
    console.log('Actualizando logos de restaurantes...');

    const updates = [
      { name: 'Pizza Palace', logo_url: '/IMAGENES/RESTAURANTES/LA%20BELLA%20ITALIA.jpg' },
      { name: 'Burger House', logo_url: '/IMAGENES/RESTAURANTES/burger-master.jpg' },
      { name: 'Sushi Zen', logo_url: '/IMAGENES/RESTAURANTES/SAKURA%20SUSHI.jpg' },
      { name: 'Tacos El Charro', logo_url: '/IMAGENES/RESTAURANTES/taco-fiesta.jpg' },
      { name: 'La Parrilla', logo_url: '/IMAGENES/RESTAURANTES/parrilla.jpg' }
    ];

    for (const restaurant of updates) {
      const result = await db.query(
        'UPDATE restaurants SET logo_url = $1 WHERE name = $2 RETURNING *',
        [restaurant.logo_url, restaurant.name]
      );
      
      if (result.rowCount > 0) {
        console.log(`✓ ${restaurant.name} actualizado con logo: ${restaurant.logo_url}`);
      } else {
        console.log(`⚠ ${restaurant.name} no encontrado en la base de datos`);
      }
    }

    console.log('\n✓ Actualización completada exitosamente');
    
    // Verificar los datos actualizados
    const restaurants = await db.query('SELECT id, name, logo_url FROM restaurants ORDER BY id');
    console.log('\nRestaurantes en la base de datos:');
    restaurants.rows.forEach(r => {
      console.log(`  ${r.id}. ${r.name}: ${r.logo_url || '(sin logo)'}`);
    });

  } catch (error) {
    console.error('Error al actualizar logos:', error);
  } finally {
    await db.end();
    console.log('\nConexión cerrada');
  }
}

updateRestaurantLogos();
