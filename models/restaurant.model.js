import { db } from '../database/connection.database.js';

// Obtener todos los restaurantes activos
const getAll = async (filters = {}) => {
  let query = `
    SELECT 
      r.*,
      COUNT(DISTINCT p.id) as products_count,
      COALESCE(AVG(o.rating), 0) as avg_rating
    FROM restaurants r
    LEFT JOIN products p ON r.id = p.restaurant_id AND p.is_available = true
    LEFT JOIN orders o ON r.id = o.restaurant_id AND o.rating IS NOT NULL
    WHERE r.is_active = true
  `;

  const params = [];
  let paramCount = 1;

  // Filtro por categoría
  if (filters.category) {
    query += ` AND r.category = $${paramCount}`;
    params.push(filters.category);
    paramCount++;
  }

  // Filtro por nombre (búsqueda)
  if (filters.search) {
    query += ` AND (r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }

  query += ` GROUP BY r.id`;

  // Ordenamiento
  const orderBy = filters.orderBy || 'rating';
  if (orderBy === 'rating') {
    query += ` ORDER BY avg_rating DESC, r.name ASC`;
  } else if (orderBy === 'name') {
    query += ` ORDER BY r.name ASC`;
  } else if (orderBy === 'delivery_time') {
    query += ` ORDER BY r.delivery_time_min ASC`;
  }

  const { rows } = await db.query(query, params);
  return rows;
};

// Obtener un restaurante por ID con sus productos
const getById = async (id) => {
  const restaurantQuery = {
    text: `
      SELECT 
        r.*,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(AVG(o.rating), 0) as avg_rating,
        COUNT(DISTINCT CASE WHEN o.rating IS NOT NULL THEN o.id END) as total_reviews
      FROM restaurants r
      LEFT JOIN orders o ON r.id = o.restaurant_id
      WHERE r.id = $1 AND r.is_active = true
      GROUP BY r.id
    `,
    values: [id],
  };

  const { rows: restaurants } = await db.query(restaurantQuery);
  
  if (restaurants.length === 0) {
    return null;
  }

  // Obtener productos del restaurante
  const productsQuery = {
    text: `
      SELECT *
      FROM products
      WHERE restaurant_id = $1 AND is_available = true
      ORDER BY category, name
    `,
    values: [id],
  };

  const { rows: products } = await db.query(productsQuery);

  return {
    ...restaurants[0],
    products,
  };
};

// Crear un nuevo restaurante (admin)
const create = async (restaurantData) => {
  const query = {
    text: `
      INSERT INTO restaurants (
        name, description, address, phone, email,
        logo_url, cover_image_url, category,
        delivery_time_min, delivery_time_max,
        delivery_cost, minimum_order, opening_hours
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
    values: [
      restaurantData.name,
      restaurantData.description,
      restaurantData.address,
      restaurantData.phone,
      restaurantData.email,
      restaurantData.logo_url || null,
      restaurantData.cover_image_url || null,
      restaurantData.category,
      restaurantData.delivery_time_min || 30,
      restaurantData.delivery_time_max || 45,
      restaurantData.delivery_cost || 0,
      restaurantData.minimum_order || 0,
      restaurantData.opening_hours || null,
    ],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un restaurante (admin)
const update = async (id, restaurantData) => {
  const query = {
    text: `
      UPDATE restaurants
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        address = COALESCE($3, address),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        logo_url = COALESCE($6, logo_url),
        cover_image_url = COALESCE($7, cover_image_url),
        category = COALESCE($8, category),
        delivery_time_min = COALESCE($9, delivery_time_min),
        delivery_time_max = COALESCE($10, delivery_time_max),
        delivery_cost = COALESCE($11, delivery_cost),
        minimum_order = COALESCE($12, minimum_order),
        is_active = COALESCE($13, is_active),
        is_open = COALESCE($14, is_open),
        opening_hours = COALESCE($15, opening_hours)
      WHERE id = $16
      RETURNING *
    `,
    values: [
      restaurantData.name,
      restaurantData.description,
      restaurantData.address,
      restaurantData.phone,
      restaurantData.email,
      restaurantData.logo_url,
      restaurantData.cover_image_url,
      restaurantData.category,
      restaurantData.delivery_time_min,
      restaurantData.delivery_time_max,
      restaurantData.delivery_cost,
      restaurantData.minimum_order,
      restaurantData.is_active,
      restaurantData.is_open,
      restaurantData.opening_hours,
      id,
    ],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar (desactivar) un restaurante (admin)
const remove = async (id) => {
  const query = {
    text: 'UPDATE restaurants SET is_active = false WHERE id = $1 RETURNING *',
    values: [id],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener categorías disponibles
const getCategories = async () => {
  const query = {
    text: `
      SELECT DISTINCT category, COUNT(*) as count
      FROM restaurants
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC, category ASC
    `,
  };

  const { rows } = await db.query(query);
  return rows;
};

export const RestaurantModel = {
  getAll,
  getById,
  create,
  update,
  remove,
  getCategories,
};
