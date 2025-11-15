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

// Obtener lista de restaurantes (admin) con filtros status/search
const getRestaurants = async (req, res) => {
  try {
    const status = (req.query.status || 'all').toLowerCase(); // 'all' | 'active' | 'pending'
    const search = (req.query.search || '').trim();

    const params = [];
    let where = '1=1';

    if (status === 'active') where += ' AND r.is_active = true';
    else if (status === 'pending') where += ' AND r.is_active = false';

    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      where += ` AND (r.name ILIKE $${params.length-1} OR r.category ILIKE $${params.length})`;
    }

    const q = `
      SELECT 
        r.id,
        r.name,
        r.category,
        r.address,
        r.phone,
        r.email,
        r.logo_url,
        r.is_active,
        r.is_open,
        COALESCE(AVG(o.rating),0)::numeric(10,2) AS avg_rating,
        COUNT(o.id)::int AS total_orders
      FROM restaurants r
      LEFT JOIN orders o ON o.restaurant_id = r.id
      WHERE ${where}
      GROUP BY r.id
      ORDER BY r.id DESC
      LIMIT 200
    `;

    const { rows } = await req.db.query(q, params);
    return res.json({ ok: true, restaurants: rows, total: rows.length });
  } catch (error) {
    console.error('Error getRestaurants (admin):', error);
    return res.status(500).json({ ok: false, msg: 'Error al obtener restaurantes' });
  }
};

// Aprobar (activar) restaurante
const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await req.db.query('UPDATE restaurants SET is_active = true WHERE id = $1 RETURNING *', [id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Restaurante no encontrado' });
    return res.json({ ok: true, message: 'Restaurante aprobado', restaurant: rows[0] });
  } catch (error) {
    console.error('Error approveRestaurant:', error);
    return res.status(500).json({ ok: false, message: 'No se pudo aprobar el restaurante' });
  }
};

// Desactivar restaurante
const deactivateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await req.db.query('UPDATE restaurants SET is_active = false WHERE id = $1 RETURNING *', [id]);
    if (!rows.length) return res.status(404).json({ ok: false, message: 'Restaurante no encontrado' });
    return res.json({ ok: true, message: 'Restaurante desactivado', restaurant: rows[0] });
  } catch (error) {
    console.error('Error deactivateRestaurant:', error);
    return res.status(500).json({ ok: false, message: 'No se pudo desactivar el restaurante' });
  }
};

// Modelo Ecosistema (Presas-Depredadores)
// S(t) = Tiendas activas, U(t) = Usuarios activos, I(t) = Incidencias
const getEcosystemModel = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    // S(t): Restaurantes activos por día (acumulado)
    const restaurantsQ = `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*)::int AS count
      FROM restaurants
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const { rows: sData } = await req.db.query(restaurantsQ);

    // U(t): Usuarios únicos haciendo pedidos por día
    const usersQ = `
      SELECT 
        DATE(created_at) AS date,
        COUNT(DISTINCT customer_id)::int AS count
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const { rows: uData } = await req.db.query(usersQ);

    // I(t): Incidencias (pedidos cancelados) por día
    const incidentsQ = `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*)::int AS count
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        AND status = 'cancelado'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const { rows: iData } = await req.db.query(incidentsQ);

    // Generar rango de fechas completo
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // Mapear datos a fechas (acumular S(t) para tiendas)
    const sMap = {};
    const uMap = {};
    const iMap = {};
    
    sData.forEach(r => sMap[r.date] = r.count);
    uData.forEach(r => uMap[r.date] = r.count);
    iData.forEach(r => iMap[r.date] = r.count);

    let accumulatedStores = 0;
    const series = dates.map(date => {
      accumulatedStores += (sMap[date] || 0);
      return {
        date,
        S: accumulatedStores,
        U: uMap[date] || 0,
        I: iMap[date] || 0
      };
    });

    return res.json({ ok: true, data: series });
  } catch (error) {
    console.error('Error getEcosystemModel:', error);
    return res.status(500).json({ ok: false, message: 'Error al obtener modelo ecosistema' });
  }
};

// Restaurantes con más pedidos por rango: day|week|month (default: day)
const getPopularRestaurantsToday = async (req, res) => {
  try {
    const range = (req.query.range || 'day').toLowerCase();
    let whereClause = "o.created_at::date = CURRENT_DATE"; // day
    if (range === 'week') {
      whereClause = "o.created_at >= date_trunc('week', CURRENT_DATE) AND o.created_at < date_trunc('week', CURRENT_DATE) + interval '7 days'";
    } else if (range === 'month') {
      whereClause = "o.created_at >= date_trunc('month', CURRENT_DATE) AND o.created_at < date_trunc('month', CURRENT_DATE) + interval '1 month'";
    }

    const q = `
      SELECT 
        r.id,
        r.name,
        COALESCE(r.rating, 0) AS base_rating,
        COUNT(o.id)::int AS orders_today,
        COALESCE(SUM(o.total), 0)::bigint AS revenue_today,
        COALESCE(AVG(o.rating), 0)::numeric(10,2) AS avg_order_rating
      FROM orders o
      JOIN restaurants r ON r.id = o.restaurant_id
      WHERE ${whereClause}
      GROUP BY r.id, r.name, r.rating
      ORDER BY orders_today DESC, revenue_today DESC
      LIMIT 7
    `;

    const { rows } = await req.db.query(q);

    // Calcular rating final en backend con fallback
    const data = rows.map(r => {
      const base = Number(r.base_rating) || 0;
      const avgR = Number(r.avg_order_rating) || 0;
      const rating = base > 0 ? base : (avgR > 0 ? avgR : 3.5);
      return {
        id: r.id,
        name: r.name,
        orders_today: r.orders_today,
        revenue_today: Number(r.revenue_today) || 0,
        rating: Math.min(5, Math.max(1, Math.round(rating * 10) / 10))
      };
    });

    return res.json({ ok: true, data });
  } catch (error) {
    console.error('Error getPopularRestaurantsToday:', error);
    return res.status(500).json({ ok: false, message: 'Error al obtener restaurantes populares' });
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

// Pedidos por día de la semana (0=Domingo ... 6=Sábado en Postgres)
const getOrdersByDay = async (req, res) => {
  try {
    const q = `
      SELECT EXTRACT(DOW FROM created_at)::int AS dow, COUNT(*)::int AS total
      FROM orders
      GROUP BY 1
    `;
    const { rows } = await req.db.query(q);

    // Mapear a arreglo Lunes..Domingo
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const r of rows) counts[r.dow] = r.total;

    // Orden lunes(1)..domingo(0)
    const ordered = [counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]];

    return res.json({ ok: true, labels: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], data: ordered });
  } catch (error) {
    console.error('Error getOrdersByDay:', error);
    return res.status(500).json({ ok: false, message: 'Error al obtener pedidos por día' });
  }
};

export const AdminController = {
  getDashboardStats,
  getUsers,
  getUserById,
  getOrders,
  getRestaurants,
  updateUser,
  getOrdersByDay,
  getPopularRestaurantsToday,
  approveRestaurant,
  deactivateRestaurant,
  getEcosystemModel
};
