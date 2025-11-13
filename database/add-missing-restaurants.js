import { db } from './connection.database.js';

async function addMissingRestaurants() {
  try {
    console.log('Agregando restaurantes faltantes...\n');

    const newRestaurants = [
      {
        name: 'Café Central',
        description: 'El mejor café y desayunos de la ciudad',
        address: 'Calle 8 #12-30, Centro',
        phone: '3112345678',
        category: 'Café',
        rating: 4.6,
        delivery_time_min: 15,
        delivery_time_max: 25,
        delivery_cost: 2000,
        minimum_order: 8000,
        logo_url: '/IMAGENES/RESTAURANTES/cafe%20central.jpg'
      },
      {
        name: 'Comida China Dragon',
        description: 'Auténtica comida china y asiática',
        address: 'Avenida 9 #18-45',
        phone: '3198765432',
        category: 'China',
        rating: 4.3,
        delivery_time_min: 30,
        delivery_time_max: 45,
        delivery_cost: 4000,
        minimum_order: 15000,
        logo_url: '/IMAGENES/RESTAURANTES/comida%20china%20dragon.jpg'
      },
      {
        name: 'Green Life',
        description: 'Comida saludable y vegana',
        address: 'Carrera 10 #20-15',
        phone: '3176543210',
        category: 'Saludable',
        rating: 4.5,
        delivery_time_min: 20,
        delivery_time_max: 30,
        delivery_cost: 3000,
        minimum_order: 12000,
        logo_url: '/IMAGENES/RESTAURANTES/GREEN%20LIFE.jpg'
      },
      {
        name: 'Heladería Tropical',
        description: 'Helados artesanales y postres deliciosos',
        address: 'Calle 12 #8-20',
        phone: '3145678901',
        category: 'Postres',
        rating: 4.8,
        delivery_time_min: 15,
        delivery_time_max: 25,
        delivery_cost: 2500,
        minimum_order: 10000,
        logo_url: '/IMAGENES/RESTAURANTES/heladeria%20tropical.jpg'
      }
    ];

    for (const restaurant of newRestaurants) {
      // Verificar si ya existe
      const existing = await db.query('SELECT id FROM restaurants WHERE name = $1', [restaurant.name]);
      
      if (existing.rows.length > 0) {
        console.log(`⚠ ${restaurant.name} ya existe en la base de datos`);
        continue;
      }

      const result = await db.query(`
        INSERT INTO restaurants (
          name, description, address, phone, category, rating,
          delivery_time_min, delivery_time_max, delivery_cost, minimum_order, logo_url,
          opening_hours
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          '{"lunes": "10:00-22:00", "martes": "10:00-22:00", "miércoles": "10:00-22:00", "jueves": "10:00-22:00", "viernes": "10:00-23:00", "sábado": "10:00-23:00", "domingo": "11:00-21:00"}'::jsonb
        )
        RETURNING id, name
      `, [
        restaurant.name,
        restaurant.description,
        restaurant.address,
        restaurant.phone,
        restaurant.category,
        restaurant.rating,
        restaurant.delivery_time_min,
        restaurant.delivery_time_max,
        restaurant.delivery_cost,
        restaurant.minimum_order,
        restaurant.logo_url
      ]);

      console.log(`✓ ${result.rows[0].name} agregado con ID: ${result.rows[0].id}`);
    }

    console.log('\n✓ Proceso completado\n');

    // Mostrar todos los restaurantes
    const all = await db.query('SELECT id, name, category FROM restaurants ORDER BY id');
    console.log('Restaurantes en la base de datos:');
    console.log('==================================');
    all.rows.forEach(r => {
      console.log(`${r.id}. ${r.name} (${r.category})`);
    });
    console.log(`\nTotal: ${all.rows.length} restaurantes\n`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
  }
}

addMissingRestaurants();
