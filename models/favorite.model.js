import { db } from '../database/connection.database.js';

// Obtener favoritos de un usuario
export const getFavoritesByUserId = async (userId) => {
  const query = {
    text: `
      SELECT 
        uf.id,
        uf.restaurant_id,
        uf.created_at,
        r.name,
        r.description,
        r.logo_url,
        r.category,
        r.delivery_cost,
        r.delivery_time_min,
        r.delivery_time_max,
        COALESCE(AVG(o.rating), 0) as avg_rating,
        COUNT(DISTINCT o.id) FILTER (WHERE o.rating IS NOT NULL) as review_count
      FROM user_favorites uf
      INNER JOIN restaurants r ON uf.restaurant_id = r.id
      LEFT JOIN orders o ON r.id = o.restaurant_id
      WHERE uf.user_id = $1 AND r.is_active = true AND COALESCE(r.status, 'active') = 'active'
      GROUP BY uf.id, uf.restaurant_id, uf.created_at, r.id
      ORDER BY uf.created_at DESC
    `,
    values: [userId]
  };

  const { rows } = await db.query(query);
  return rows;
};

// Obtener IDs de restaurantes favoritos de un usuario
export const getFavoriteRestaurantIds = async (userId) => {
  const query = {
    text: 'SELECT restaurant_id FROM user_favorites WHERE user_id = $1',
    values: [userId]
  };

  const { rows } = await db.query(query);
  return rows.map(row => row.restaurant_id);
};

// Verificar si un restaurante es favorito
export const isFavorite = async (userId, restaurantId) => {
  const query = {
    text: 'SELECT id FROM user_favorites WHERE user_id = $1 AND restaurant_id = $2',
    values: [userId, restaurantId]
  };

  const { rows } = await db.query(query);
  return rows.length > 0;
};

// Agregar restaurante a favoritos
export const addFavorite = async (userId, restaurantId) => {
  const query = {
    text: `
      INSERT INTO user_favorites (user_id, restaurant_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, restaurant_id) DO NOTHING
      RETURNING *
    `,
    values: [userId, restaurantId]
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Eliminar restaurante de favoritos
export const removeFavorite = async (userId, restaurantId) => {
  const query = {
    text: 'DELETE FROM user_favorites WHERE user_id = $1 AND restaurant_id = $2 RETURNING *',
    values: [userId, restaurantId]
  };

  const { rows } = await db.query(query);
  return rows[0];
};

export const FavoriteModel = {
  getFavoritesByUserId,
  getFavoriteRestaurantIds,
  isFavorite,
  addFavorite,
  removeFavorite
};
