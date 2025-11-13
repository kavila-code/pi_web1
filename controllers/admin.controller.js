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
    console.log('🔎 getUsers: iniciando consulta de usuarios');
    // Consultar todos los usuarios (la tabla users tiene las columnas directamente)
    const query = `
      SELECT 
        u.uid as id,
        u.username,
        u.email,
        u.created_at,
        -- Datos básicos (pueden existir en users o en user_details)
        COALESCE(u.cedula, ud.cedula) AS cedula,
        COALESCE(u.nombre, ud.nombre) AS nombre,
        COALESCE(u.apellidos, ud.apellidos) AS apellidos,
        COALESCE(u.telefono1, ud.telefono1) AS telefono1,
        COALESCE(u.telefono2, ud.telefono2) AS telefono2,
        COALESCE(u.direccion, ud.direccion) AS direccion,
        -- En users hay strings municipio/departamento, en user_details solo ids
        u.municipio,
        u.departamento,
        ud.municipio_id,
        ud.departamento_id
      FROM users u
      LEFT JOIN user_details ud ON ud.user_id = u.uid
      ORDER BY u.created_at DESC
    `;

    const usersResult = await req.db.query(query);
    console.log(`✅ getUsers: ${usersResult.rows.length} usuarios encontrados`);

    // Obtener roles de cada usuario
    const usersWithRoles = await Promise.all(
      usersResult.rows.map(async (user) => {
        const rolesResult = await req.db.query(
          'SELECT role FROM user_roles WHERE user_id = $1',
          [user.id]
        );
        const roles = rolesResult.rows.map(r => r.role);
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
          cedula: user.cedula,
          nombre: user.nombre,
          apellidos: user.apellidos,
          telefono1: user.telefono1,
          telefono2: user.telefono2,
          direccion: user.direccion,
          municipio: user.municipio,
          departamento: user.departamento,
          municipio_id: user.municipio_id,
          departamento_id: user.departamento_id,
          roles: roles.length ? roles : ['cliente']
        };
      })
    );

    console.log('✅ getUsers: roles asociados correctamente');
    console.log(`📊 Total usuarios a enviar: ${usersWithRoles.length}`);
    return res.json({ ok: true, users: usersWithRoles, total: usersWithRoles.length });
  } catch (error) {
    console.error('🔥 Error al obtener usuarios:', error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener usuarios', error: error.message });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Datos del usuario
    const userQuery = `
      SELECT 
        u.uid as id,
        u.username,
        u.email,
        u.created_at,
        COALESCE(u.cedula, ud.cedula) AS cedula,
        COALESCE(u.nombre, ud.nombre) AS nombre,
        COALESCE(u.apellidos, ud.apellidos) AS apellidos,
        COALESCE(u.telefono1, ud.telefono1) AS telefono1,
        COALESCE(u.telefono2, ud.telefono2) AS telefono2,
        COALESCE(u.direccion, ud.direccion) AS direccion,
        u.municipio,
        u.departamento,
        ud.municipio_id,
        ud.departamento_id
      FROM users u
      LEFT JOIN user_details ud ON ud.user_id = u.uid
      WHERE u.uid = $1
      LIMIT 1
    `;

    const userResult = await req.db.query(userQuery, [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];

    // Roles del usuario
    const rolesResult = await req.db.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [user.id]
    );
    const roles = rolesResult.rows.map(r => r.role);

    return res.json({ ok: true, user: { ...user, roles } });
  } catch (error) {
    console.error('🔥 Error al obtener usuario por id:', error);
    return res.status(500).json({ ok: false, message: 'Error al obtener el usuario' });
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

// Actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, cedula, nombre, apellidos, telefono1, telefono2, direccion, municipio, departamento } = req.body;

    console.log('🔄 updateUser: actualizando usuario', userId);

    // Validar que el usuario existe
    const userCheck = await req.db.query('SELECT uid FROM users WHERE uid = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
    }

    // Actualizar usuario
    const updateQuery = `
      UPDATE users 
      SET 
        username = $1,
        email = $2,
        cedula = $3,
        nombre = $4,
        apellidos = $5,
        telefono1 = $6,
        telefono2 = $7,
        direccion = $8,
        municipio = $9,
        departamento = $10
      WHERE uid = $11
      RETURNING *
    `;

    const values = [username, email, cedula, nombre, apellidos, telefono1, telefono2, direccion, municipio, departamento, userId];
    const result = await req.db.query(updateQuery, values);

    console.log('✅ updateUser: usuario actualizado exitosamente');

    return res.json({
      ok: true,
      message: 'Usuario actualizado exitosamente',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ updateUser error:', error);
    return res.status(500).json({ ok: false, message: 'Error al actualizar el usuario' });
  }
};

export const AdminController = {
  getDashboardStats,
  getUsers,
  getUserById,
  getOrders,
  getRestaurants,
  updateUser
};
