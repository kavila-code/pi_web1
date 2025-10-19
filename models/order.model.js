import { db } from '../database/connection.database.js';

// Generar número de orden único
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

// Crear un nuevo pedido
const create = async (orderData, items) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // Generar número de orden único
    const orderNumber = generateOrderNumber();

    // Insertar el pedido
    const orderQuery = {
      text: `
        INSERT INTO orders (
          order_number, customer_id, restaurant_id,
          delivery_address, delivery_phone, delivery_notes,
          subtotal, delivery_fee, discount_amount, tax_amount, total,
          payment_method
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `,
      values: [
        orderNumber,
        orderData.customer_id,
        orderData.restaurant_id,
        orderData.delivery_address,
        orderData.delivery_phone,
        orderData.delivery_notes || null,
        orderData.subtotal,
        orderData.delivery_fee || 0,
        orderData.discount_amount || 0,
        orderData.tax_amount || 0,
        orderData.total,
        orderData.payment_method || 'efectivo',
      ],
    };

    const { rows: [order] } = await client.query(orderQuery);

    // Insertar los items del pedido
    for (const item of items) {
      const itemQuery = {
        text: `
          INSERT INTO order_items (
            order_id, product_id, product_name, product_price,
            quantity, subtotal, special_instructions
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        values: [
          order.id,
          item.product_id,
          item.product_name,
          item.product_price,
          item.quantity,
          item.subtotal,
          item.special_instructions || null,
        ],
      };

      await client.query(itemQuery);
    }

    // Registrar en el historial de estados
    const historyQuery = {
      text: `
        INSERT INTO order_status_history (order_id, status, changed_by, notes)
        VALUES ($1, $2, $3, $4)
      `,
      values: [order.id, 'pendiente', orderData.customer_id, 'Pedido creado'],
    };

    await client.query(historyQuery);

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Obtener pedidos de un cliente
const getByCustomer = async (customerId, filters = {}) => {
  let query = `
    SELECT 
      o.*,
      r.name as restaurant_name,
      r.logo_url as restaurant_logo,
      u.username as delivery_person_name,
      COUNT(oi.id) as items_count
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    LEFT JOIN users u ON o.delivery_person_id = u.uid
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.customer_id = $1
  `;

  const params = [customerId];
  let paramCount = 2;

  // Filtro por estado
  if (filters.status) {
    query += ` AND o.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }

  query += ` GROUP BY o.id, r.name, r.logo_url, u.username`;
  query += ` ORDER BY o.created_at DESC`;

  // Paginación
  if (filters.limit) {
    query += ` LIMIT $${paramCount}`;
    params.push(filters.limit);
    paramCount++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramCount}`;
    params.push(filters.offset);
  }

  const { rows } = await db.query(query, params);
  return rows;
};

// Obtener pedidos de un restaurante
const getByRestaurant = async (restaurantId, filters = {}) => {
  let query = `
    SELECT 
      o.*,
      u.username as customer_name,
      u.email as customer_email,
      d.username as delivery_person_name,
      COUNT(oi.id) as items_count
    FROM orders o
    JOIN users u ON o.customer_id = u.uid
    LEFT JOIN users d ON o.delivery_person_id = d.uid
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.restaurant_id = $1
  `;

  const params = [restaurantId];
  let paramCount = 2;

  // Filtro por estado
  if (filters.status) {
    query += ` AND o.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }

  query += ` GROUP BY o.id, u.username, u.email, d.username`;
  query += ` ORDER BY o.created_at DESC`;

  const { rows } = await db.query(query, params);
  return rows;
};

// Obtener pedidos disponibles para domiciliarios
const getAvailableForDelivery = async (filters = {}) => {
  const query = {
    text: `
      SELECT 
        o.*,
        r.name as restaurant_name,
        r.address as restaurant_address,
        r.logo_url as restaurant_logo,
        u.username as customer_name,
        COUNT(oi.id) as items_count
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      JOIN users u ON o.customer_id = u.uid
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'listo' AND o.delivery_person_id IS NULL
      GROUP BY o.id, r.name, r.address, r.logo_url, u.username
      ORDER BY o.created_at ASC
    `,
  };

  const { rows } = await db.query(query);
  return rows;
};

// Obtener pedidos asignados a un domiciliario
const getByDeliveryPerson = async (deliveryPersonId, filters = {}) => {
  let query = `
    SELECT 
      o.*,
      r.name as restaurant_name,
      r.address as restaurant_address,
      r.phone as restaurant_phone,
      r.logo_url as restaurant_logo,
      u.username as customer_name,
      u.email as customer_email,
      COUNT(oi.id) as items_count
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    JOIN users u ON o.customer_id = u.uid
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.delivery_person_id = $1
  `;

  const params = [deliveryPersonId];
  let paramCount = 2;

  // Filtro por estado
  if (filters.status) {
    query += ` AND o.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  } else {
    // Por defecto, mostrar solo pedidos activos
    query += ` AND o.status IN ('listo', 'en_camino')`;
  }

  query += ` GROUP BY o.id, r.name, r.address, r.phone, r.logo_url, u.username, u.email`;
  query += ` ORDER BY o.created_at DESC`;

  const { rows } = await db.query(query, params);
  return rows;
};

// Obtener todos los pedidos (admin)
const getAll = async (filters = {}) => {
  let query = `
    SELECT 
      o.*,
      r.name as restaurant_name,
      r.logo_url as restaurant_logo,
      u.username as customer_name,
      u.email as customer_email,
      d.username as delivery_person_name,
      COUNT(oi.id) as items_count
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    JOIN users u ON o.customer_id = u.uid
    LEFT JOIN users d ON o.delivery_person_id = d.uid
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  // Filtro por estado
  if (filters.status) {
    query += ` AND o.status = $${paramCount}`;
    params.push(filters.status);
    paramCount++;
  }

  // Filtro por restaurante
  if (filters.restaurant_id) {
    query += ` AND o.restaurant_id = $${paramCount}`;
    params.push(filters.restaurant_id);
    paramCount++;
  }

  // Filtro por domiciliario
  if (filters.delivery_person_id) {
    query += ` AND o.delivery_person_id = $${paramCount}`;
    params.push(filters.delivery_person_id);
    paramCount++;
  }

  // Filtro por fecha
  if (filters.date_from) {
    query += ` AND o.created_at >= $${paramCount}`;
    params.push(filters.date_from);
    paramCount++;
  }

  if (filters.date_to) {
    query += ` AND o.created_at <= $${paramCount}`;
    params.push(filters.date_to);
    paramCount++;
  }

  query += ` GROUP BY o.id, r.name, r.logo_url, u.username, u.email, d.username`;
  query += ` ORDER BY o.created_at DESC`;

  // Paginación
  if (filters.limit) {
    query += ` LIMIT $${paramCount}`;
    params.push(filters.limit);
    paramCount++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramCount}`;
    params.push(filters.offset);
  }

  const { rows } = await db.query(query, params);
  return rows;
};

// Obtener un pedido por ID con todos los detalles
const getById = async (id) => {
  const orderQuery = {
    text: `
      SELECT 
        o.*,
        r.name as restaurant_name,
        r.address as restaurant_address,
        r.phone as restaurant_phone,
        r.logo_url as restaurant_logo,
        u.username as customer_name,
        u.email as customer_email,
        u.uid as customer_uid,
        d.username as delivery_person_name,
        d.email as delivery_person_email,
        d.uid as delivery_person_uid
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      JOIN users u ON o.customer_id = u.uid
      LEFT JOIN users d ON o.delivery_person_id = d.uid
      WHERE o.id = $1
    `,
    values: [id],
  };

  const { rows: orders } = await db.query(orderQuery);

  if (orders.length === 0) {
    return null;
  }

  // Obtener items del pedido
  const itemsQuery = {
    text: `
      SELECT oi.*, p.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY oi.id
    `,
    values: [id],
  };

  const { rows: items } = await db.query(itemsQuery);

  // Obtener historial de estados
  const historyQuery = {
    text: `
      SELECT 
        osh.*,
        u.username as changed_by_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.changed_by = u.uid
      WHERE osh.order_id = $1
      ORDER BY osh.created_at ASC
    `,
    values: [id],
  };

  const { rows: history } = await db.query(historyQuery);

  return {
    ...orders[0],
    items,
    history,
  };
};

// Actualizar estado del pedido
const updateStatus = async (id, status, changedBy, notes = null) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Definir campo de timestamp según el estado
    const timestampField = {
      confirmado: 'confirmed_at',
      preparando: 'preparing_at',
      listo: 'ready_at',
      en_camino: 'picked_up_at',
      entregado: 'delivered_at',
      cancelado: 'cancelled_at',
    }[status];

    let updateQuery = `
      UPDATE orders
      SET status = $1
    `;

    const params = [status];
    let paramCount = 2;

    if (timestampField) {
      updateQuery += `, ${timestampField} = CURRENT_TIMESTAMP`;
    }

    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const { rows: [order] } = await client.query(updateQuery, params);

    // Registrar en el historial
    const historyQuery = {
      text: `
        INSERT INTO order_status_history (order_id, status, changed_by, notes)
        VALUES ($1, $2, $3, $4)
      `,
      values: [id, status, changedBy, notes],
    };

    await client.query(historyQuery);

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Asignar domiciliario a un pedido
const assignDeliveryPerson = async (orderId, deliveryPersonId, assignedBy) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const updateQuery = {
      text: `
        UPDATE orders
        SET delivery_person_id = $1
        WHERE id = $2 AND status = 'listo'
        RETURNING *
      `,
      values: [deliveryPersonId, orderId],
    };

    const { rows: [order] } = await client.query(updateQuery);

    if (!order) {
      throw new Error('Pedido no encontrado o no está listo para asignar');
    }

    // Cambiar estado a "en_camino"
    await client.query({
      text: 'UPDATE orders SET status = $1, picked_up_at = CURRENT_TIMESTAMP WHERE id = $2',
      values: ['en_camino', orderId],
    });

    // Registrar en el historial
    await client.query({
      text: `
        INSERT INTO order_status_history (order_id, status, changed_by, notes)
        VALUES ($1, $2, $3, $4)
      `,
      values: [orderId, 'en_camino', assignedBy, `Domiciliario asignado`],
    });

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Cancelar un pedido
const cancel = async (id, cancelledBy, reason) => {
  return updateStatus(id, 'cancelado', cancelledBy, reason);
};

// Agregar calificación y reseña
const addReview = async (id, customerId, rating, review) => {
  const query = {
    text: `
      UPDATE orders
      SET rating = $1, review = $2, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND customer_id = $4 AND status = 'entregado'
      RETURNING *
    `,
    values: [rating, review, id, customerId],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Obtener estadísticas de pedidos
const getStats = async (filters = {}) => {
  const query = {
    text: `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pendiente' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmado' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'preparando' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'listo' THEN 1 END) as ready_orders,
        COUNT(CASE WHEN status = 'en_camino' THEN 1 END) as in_delivery_orders,
        COUNT(CASE WHEN status = 'entregado' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'entregado' THEN total ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status = 'entregado' THEN total ELSE NULL END), 0) as average_order_value
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `,
  };

  const { rows } = await db.query(query);
  return rows[0];
};

export const OrderModel = {
  create,
  getByCustomer,
  getByRestaurant,
  getAvailableForDelivery,
  getByDeliveryPerson,
  getAll,
  getById,
  updateStatus,
  assignDeliveryPerson,
  cancel,
  addReview,
  getStats,
  generateOrderNumber,
};
