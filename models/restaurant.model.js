import { db } from '../database/connection.database.js';

// Obtener todos los restaurantes activos (solo aprobados)
const getAll = async (filters = {}) => {
  let query = `
    SELECT 
      r.*,
      COUNT(DISTINCT p.id) as products_count,
      COALESCE(AVG(o.rating), 0) as avg_rating
    FROM restaurants r
    LEFT JOIN products p ON r.id = p.restaurant_id AND p.is_available = true
    LEFT JOIN orders o ON r.id = o.restaurant_id AND o.rating IS NOT NULL
    WHERE r.is_active = true AND COALESCE(r.status, 'active') = 'active'
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

// Obtener un restaurante por ID con sus productos (solo activos)
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
      WHERE r.id = $1 AND r.is_active = true AND COALESCE(r.status, 'active') = 'active'
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

// Obtener un restaurante por ID sin filtros de status (para propietarios)
const getByIdRaw = async (id) => {
  const restaurantQuery = {
    text: `
      SELECT 
        r.*,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(AVG(o.rating), 0) as avg_rating,
        COUNT(DISTINCT CASE WHEN o.rating IS NOT NULL THEN o.id END) as total_reviews
      FROM restaurants r
      LEFT JOIN orders o ON r.id = o.restaurant_id
      WHERE r.id = $1
      GROUP BY r.id
    `,
    values: [id],
  };

  const { rows: restaurants } = await db.query(restaurantQuery);
  return restaurants[0] || null;
};

// Crear un nuevo restaurante (admin)
const create = async (restaurantData) => {
  const statusValue = restaurantData.status
    ? restaurantData.status
    : (restaurantData.is_active ? 'active' : 'pending');

  const query = {
    text: `
      INSERT INTO restaurants (
        name, description, address, phone, email,
        logo_url, cover_image_url, category,
        delivery_time_min, delivery_time_max,
        delivery_cost, minimum_order, opening_hours, is_active, status, owner_user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
      restaurantData.is_active !== undefined ? restaurantData.is_active : true,
      statusValue,
      restaurantData.owner_user_id || null,
    ],
  };

  // Debug: verificar bandera is_active en creación
  try {
    console.log('[RestaurantModel.create] is_active:', restaurantData.is_active, 'status:', statusValue);
  } catch {}

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
        opening_hours = COALESCE($15, opening_hours),
        status = COALESCE($16, status)
      WHERE id = $17
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
      restaurantData.status,
      id,
    ],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar (borrado lógico) un restaurante (admin)
// Marca is_active=false y status='deleted' para que no aparezca en listados
const remove = async (id) => {
  const query = {
    text: "UPDATE restaurants SET is_active = false, status = 'deleted' WHERE id = $1 RETURNING *",
    values: [id],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar de forma permanente (borrado duro)
// Nota: intenta limpiar dependencias directas conocidas (favorites, products).
// Si existen restricciones por órdenes, el DELETE puede fallar; en tal caso
// el controlador usará remove() como fallback.
const removeHard = async (id) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // Dependencias conocidas
    try { await client.query('DELETE FROM user_favorites WHERE restaurant_id = $1', [id]); } catch {}
    try { await client.query('DELETE FROM products WHERE restaurant_id = $1', [id]); } catch {}
    // Borrado del restaurante
    const delRes = await client.query('DELETE FROM restaurants WHERE id = $1 RETURNING *', [id]);
    await client.query('COMMIT');
    return delRes.rows[0] || null;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
  }
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

// Obtener restaurantes recomendados (top por calificación y entregas)
const getRecommended = async (limit = 3) => {
  const query = {
    text: `
      SELECT
        r.id,
        r.name,
        r.category,
        r.logo_url,
        r.cover_image_url,
        r.delivery_time_min,
        r.delivery_time_max,
        COALESCE(ROUND(AVG(o.rating) FILTER (WHERE o.rating IS NOT NULL), 1), r.rating) AS avg_rating,
        COUNT(*) FILTER (WHERE o.status = 'entregado') AS delivered_count
      FROM restaurants r
      LEFT JOIN orders o ON o.restaurant_id = r.id
      WHERE r.is_active = true
        AND (r.logo_url IS NOT NULL OR r.cover_image_url IS NOT NULL)
        AND EXISTS (
          SELECT 1 FROM products p
          WHERE p.restaurant_id = r.id AND p.is_available = true
        )
      GROUP BY r.id
      ORDER BY delivered_count DESC, avg_rating DESC NULLS LAST, r.name ASC
      LIMIT $1
    `,
    values: [limit]
  };

  const { rows: firstBatch } = await db.query(query);
  let rows = firstBatch;

  if (rows.length < limit) {
    const needed = limit - rows.length;
    const excludeIds = rows.map(r => r.id);

    let text = `
      SELECT 
        r.id,
        r.name,
        r.category,
        r.logo_url,
        r.cover_image_url,
        r.delivery_time_min,
        r.delivery_time_max,
        r.rating AS avg_rating,
        0 AS delivered_count
      FROM restaurants r
      WHERE r.is_active = true
        AND (r.logo_url IS NOT NULL OR r.cover_image_url IS NOT NULL)
        AND EXISTS (
          SELECT 1 FROM products p
          WHERE p.restaurant_id = r.id AND p.is_available = true
        )`;

    const values = [];
    if (excludeIds.length > 0) {
      const placeholders = excludeIds.map((_, i) => `$${i + 1}`).join(',');
      text += ` AND r.id NOT IN (${placeholders})`;
      excludeIds.forEach(id => values.push(id));
    }

    values.push(needed);
    text += `
      ORDER BY r.rating DESC NULLS LAST, r.name ASC
      LIMIT $${values.length}
    `;

    const { rows: fallback } = await db.query({ text, values });
    rows = rows.concat(fallback);
  }

  return rows;
};

// Obtener restaurantes del usuario (propietario)
const getByOwner = async (userId) => {
  const query = {
    text: `
      SELECT 
        r.*,
        COUNT(DISTINCT p.id) as products_count,
        COALESCE(AVG(o.rating), 0) as avg_rating,
        COUNT(DISTINCT o.id) as total_orders
      FROM restaurants r
      LEFT JOIN products p ON r.id = p.restaurant_id
      LEFT JOIN orders o ON r.id = o.restaurant_id
      WHERE r.owner_user_id = $1
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `,
    values: [userId],
  };

  const { rows } = await db.query(query);
  return rows;
};

export const RestaurantModel = {
  getAll,
  getById,
  getByIdRaw,
  create,
  update,
  remove,
  getCategories,
  getRecommended,
  getByOwner,
};
