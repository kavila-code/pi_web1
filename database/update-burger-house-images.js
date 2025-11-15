import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  allowExitOnIdle: true
});

async function updateBurgerHouseImages() {
  try {
    console.log('🍔 Actualizando imágenes de productos de Burger House...');

    const updates = [
      { name: 'Burger Clásica', image: '/IMAGENES/COMIDA/hamburguesa-clasica.jpg' },
      { name: 'Burger BBQ Bacon', image: '/IMAGENES/COMIDA/burguer bbq bacon.jpeg' },
      { name: 'Burger Vegetariana', image: '/IMAGENES/COMIDA/burger vegetariana.jpg' },
      { name: 'Papas Fritas Grandes', image: '/IMAGENES/COMIDA/papas fritas grandes.png' },
      { name: 'Aros de Cebolla', image: '/IMAGENES/COMIDA/aros de cebolla.jpeg' },
      { name: 'Malteada de Chocolate', image: '/IMAGENES/COMIDA/malteada de chocolate.jpg' },
      { name: 'Nuggets de Pollo (10 und)', image: '/IMAGENES/COMIDA/nuggets de pollo (!0 und).jpg' }
    ];

    for (const product of updates) {
      const result = await pool.query(
        `UPDATE products 
         SET image_url = $1 
         WHERE name = $2 AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Burger House')`,
        [product.image, product.name]
      );
      
      if (result.rowCount > 0) {
        console.log(`✓ ${product.name} actualizado con imagen: ${product.image}`);
      } else {
        console.log(`⚠ ${product.name} no encontrado`);
      }
    }

    console.log('✅ Actualización completada');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

updateBurgerHouseImages();
