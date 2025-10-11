import { UserModel } from '../models/user.model.js';

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Aquí podrías hacer consultas reales a la base de datos
    // Por ahora devolvemos datos mock
    const stats = {
      totalUsers: 1234,
      totalOrders: 5678,
      totalRestaurants: 89,
      totalRevenue: 45890,
      recentActivity: [
        {
          type: 'user_registered',
          message: 'Nuevo usuario registrado: María González',
          time: '5 minutos',
          icon: 'person-plus',
          color: 'success'
        },
        {
          type: 'new_order',
          message: 'Nuevo pedido: #12345 - Pizza Margherita',
          time: '12 minutos',
          icon: 'cart-plus',
          color: 'primary'
        },
        {
          type: 'new_restaurant',
          message: 'Nuevo restaurante: Comida Italiana Marco',
          time: '1 hora',
          icon: 'shop',
          color: 'warning'
        },
        {
          type: 'new_review',
          message: 'Nueva reseña: 5★ para Burger House',
          time: '2 horas',
          icon: 'star',
          color: 'info'
        }
      ]
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