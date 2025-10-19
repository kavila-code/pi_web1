import { UserModel } from '../models/user.model.js';

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Usuarios
    const usersResult = await req.db.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count, 10);

    // Restaurantes
    const restaurantsResult = await req.db.query('SELECT COUNT(*) FROM restaurants WHERE is_active = true');
    const totalRestaurants = parseInt(restaurantsResult.rows[0].count, 10);

    // Pedidos y revenue
    const orderStats = await req.db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status = 'entregado' THEN total ELSE 0 END), 0) as total_revenue
      FROM orders
    `);
    const totalOrders = parseInt(orderStats.rows[0].total_orders, 10);
    const totalRevenue = parseInt(orderStats.rows[0].total_revenue, 10);

    // Respuesta
    const stats = {
      totalUsers,
      totalOrders,
      totalRestaurants,
      totalRevenue
    };

    return res.json({
      ok: true,
      stats
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Obtener lista de usuarios
const getUsers = async (req, res) => {
  try {
    // Aquí implementarías la lógica para obtener todos los usuarios
    // Por ahora devolvemos datos mock
    const users = [
      {
        uid: 1,
        username: 'Juan Pérez',
        email: 'juan@email.com',
        role: 'user',
        created_at: '2024-10-01',
        status: 'active'
      },
      {
        uid: 2,
        username: 'María González',
        email: 'maria@email.com',
        role: 'user',
        created_at: '2024-10-05',
        status: 'active'
      },
      {
        uid: 3,
        username: 'Admin Principal',
        email: 'admin@domitulua.com',
        role: 'admin',
        created_at: '2024-09-15',
        status: 'active'
      }
    ];

    return res.json({
      ok: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Obtener lista de pedidos
const getOrders = async (req, res) => {
  try {
    // Datos mock para pedidos
    const orders = [
      {
        id: 12345,
        user: 'Juan Pérez',
        restaurant: 'Pizza Palace',
        items: 'Pizza Margherita x2',
        total: 24.99,
        status: 'delivered',
        created_at: '2024-10-05 14:30'
      },
      {
        id: 12344,
        user: 'María González',
        restaurant: 'Burger House',
        items: 'Hamburguesa Clásica x1, Papas x1',
        total: 18.50,
        status: 'preparing',
        created_at: '2024-10-05 13:45'
      }
    ];

    return res.json({
      ok: true,
      orders,
      total: orders.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Obtener lista de restaurantes
const getRestaurants = async (req, res) => {
  try {
    // Datos mock para restaurantes
    const restaurants = [
      {
        id: 1,
        name: 'Pizza Palace',
        category: 'Italiana',
        rating: 4.8,
        orders_today: 234,
        revenue_today: 2340,
        status: 'active'
      },
      {
        id: 2,
        name: 'Burger House',
        category: 'Comida Rápida',
        rating: 4.6,
        orders_today: 189,
        revenue_today: 1890,
        status: 'active'
      },
      {
        id: 3,
        name: 'Sushi Zen',
        category: 'Japonesa',
        rating: 4.9,
        orders_today: 156,
        revenue_today: 1560,
        status: 'active'
      }
    ];

    return res.json({
      ok: true,
      restaurants,
      total: restaurants.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

export const AdminController = {
  getDashboardStats,
  getUsers,
  getOrders,
  getRestaurants
};