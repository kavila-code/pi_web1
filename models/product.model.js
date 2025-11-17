import { db } from '../database/connection.database.js';

// Obtener todos los productos de un restaurante
const getByRestaurant = async (restaurantId, filters = {}) => {
  let query = `
    SELECT * FROM products
    WHERE restaurant_id = $1 AND is_available = true
  `;

  const params = [restaurantId];
  let paramCount = 2;

  // Filtro por categoría
  if (filters.category) {
    query += ` AND category = $${paramCount}`;
    params.push(filters.category);
    paramCount++;
  }

  // Filtro por vegetariano
  if (filters.vegetarian === 'true') {
    query += ` AND is_vegetarian = true`;
  }

  // Filtro por vegano
  if (filters.vegan === 'true') {
    query += ` AND is_vegan = true`;
  }

  // Búsqueda por nombre
  if (filters.search) {
    query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
    params.push(`%${filters.search}%`);
    paramCount++;
  }

  query += ` ORDER BY category, name`;

  const { rows } = await db.query(query, params);
  return rows;
};

// Obtener un producto por ID
const getById = async (id) => {
  const query = {
    text: `
      SELECT p.*, r.name as restaurant_name, r.is_open as restaurant_is_open
      FROM products p
      JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.id = $1
    `,
    values: [id],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener productos por IDs (para carrito)
const getByIds = async (ids) => {
  const query = {
    text: `
      SELECT p.*, r.name as restaurant_name, r.is_active as restaurant_is_active, r.is_open as restaurant_is_open
      FROM products p
      JOIN restaurants r ON p.restaurant_id = r.id
      WHERE p.id = ANY($1)
    `,
    values: [ids],
  };

  const { rows } = await db.query(query);
  return rows;
};

// Crear un nuevo producto (admin)
const create = async (productData) => {
  const query = {
    text: `
      INSERT INTO products (
        restaurant_id, name, description, price,
        image_url, category, preparation_time,
        calories, is_vegetarian, is_vegan, allergens
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    values: [
      productData.restaurant_id,
      productData.name,
      productData.description,
      productData.price,
      productData.image_url || null,
      productData.category,
      productData.preparation_time || 15,
      productData.calories || null,
      productData.is_vegetarian || false,
      productData.is_vegan || false,
      productData.allergens || null,
    ],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Actualizar un producto (admin)
const update = async (id, productData) => {
  const query = {
    text: `
      UPDATE products
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        image_url = COALESCE($4, image_url),
        category = COALESCE($5, category),
        is_available = COALESCE($6, is_available),
        discount_percentage = COALESCE($7, discount_percentage),
        preparation_time = COALESCE($8, preparation_time),
        calories = COALESCE($9, calories),
        is_vegetarian = COALESCE($10, is_vegetarian),
        is_vegan = COALESCE($11, is_vegan),
        allergens = COALESCE($12, allergens)
      WHERE id = $13
      RETURNING *
    `,
    values: [
      productData.name,
      productData.description,
      productData.price,
      productData.image_url,
      productData.category,
      productData.is_available,
      productData.discount_percentage,
      productData.preparation_time,
      productData.calories,
      productData.is_vegetarian,
      productData.is_vegan,
      productData.allergens,
      id,
    ],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar (desactivar) un producto (admin)
const remove = async (id) => {
  const query = {
    text: 'UPDATE products SET is_available = false WHERE id = $1 RETURNING *',
    values: [id],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener categorías de productos de un restaurante
const getCategoriesByRestaurant = async (restaurantId) => {
  const query = {
    text: `
      SELECT DISTINCT category, COUNT(*) as count
      FROM products
      WHERE restaurant_id = $1 AND is_available = true
      GROUP BY category
      ORDER BY category ASC
    `,
    values: [restaurantId],
  };

  const { rows } = await db.query(query);
  return rows;
};

export const ProductModel = {
  getByRestaurant,
  getById,
  getByIds,
  create,
  update,
  remove,
  getCategoriesByRestaurant,
};

// Obtener productos destacados (global, activos)
const getFeatured = async (limit = 12) => {
  const query = {
    text: `
      SELECT 
        p.id,
        p.restaurant_id,
        p.name,
        p.description,
        p.category,
        p.price,
        p.image_url,
        r.name AS restaurant_name
      FROM products p
      JOIN restaurants r ON r.id = p.restaurant_id
      WHERE p.is_available = true
        AND r.is_active = true
        AND COALESCE(r.status, 'active') = 'active'
      ORDER BY p.id DESC
      LIMIT $1
    `,
    values: [limit],
  };

  const { rows } = await db.query(query);
  return rows;
};

// Extender export con getFeatured
ProductModel.getFeatured = getFeatured;
