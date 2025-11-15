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

// Indicadores de Actividad de la Plataforma
// S(t) = Restaurantes activos, U(t) = Usuarios activos, I(t) = Pedidos cancelados
const getEcosystemModel = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    // S(t): Restaurantes activos (is_active=true) acumulados por fecha
    const restaurantsQ = `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*)::int AS count
      FROM restaurants
      WHERE is_active = true
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
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

// Obtener métricas del modelo M/M/c (Teoría de Colas)
const getQueueMetrics = async (req, res) => {
  try {
    // 1. Calcular λ (tasa de llegada de pedidos por minuto)
    const lambdaQuery = await req.db.query(`
      SELECT 
        COUNT(*) as total_orders,
        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/60 as minutes_range
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND status NOT IN ('cancelado')
    `);
    
    const ordersData = lambdaQuery.rows[0];
    const lambda = ordersData.minutes_range > 0 
      ? ordersData.total_orders / ordersData.minutes_range 
      : 0;

    // 2. Calcular μ (tasa de servicio - pedidos por minuto por repartidor)
    const muQuery = await req.db.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (delivered_at - picked_up_at))/60) as avg_delivery_time_minutes
      FROM orders
      WHERE status = 'entregado'
        AND picked_up_at IS NOT NULL
        AND delivered_at IS NOT NULL
        AND created_at >= NOW() - INTERVAL '7 days'
    `);
    
    const avgDeliveryTime = muQuery.rows[0].avg_delivery_time_minutes || 30;
    const mu = avgDeliveryTime > 0 ? 1 / avgDeliveryTime : 0;

    // 3. Obtener c (número de repartidores activos)
    const cQuery = await req.db.query(`
      SELECT COUNT(DISTINCT user_id) as active_delivery_count
      FROM user_roles
      WHERE role = 'delivery'
    `);
    
    const c = parseInt(cQuery.rows[0].active_delivery_count) || 1;

    // 4. Calcular métricas M/M/c
    const rho = lambda / (mu * c); // Factor de utilización
    
    // Para M/M/c, Lq (pedidos en cola) requiere fórmulas de Erlang-C
    // Simplificación: usando aproximación
    let Lq = 0;
    let Wq = 0;
    
    if (rho < 1 && mu > 0 && c > 0) {
      // Probabilidad de cola (C de Erlang - aproximación)
      const rhoC = Math.pow(lambda/mu, c) / factorial(c);
      const sumTerms = Array.from({length: c}, (_, i) => 
        Math.pow(lambda/mu, i) / factorial(i)
      ).reduce((a, b) => a + b, 0);
      
      const C = rhoC / (sumTerms + rhoC * (1 - rho));
      
      // Lq: longitud promedio de la cola
      Lq = (C * rho) / (1 - rho);
      
      // Wq: tiempo promedio de espera en cola (minutos)
      Wq = lambda > 0 ? Lq / lambda : 0;
    }

    return res.json({
      ok: true,
      metrics: {
        lambda: parseFloat(lambda.toFixed(4)),           // pedidos/minuto
        mu: parseFloat(mu.toFixed(4)),                   // servicio/minuto por repartidor
        c: c,                                             // repartidores activos
        rho: parseFloat(rho.toFixed(4)),                 // factor de utilización
        Lq: parseFloat(Lq.toFixed(2)),                   // pedidos en cola
        Wq: parseFloat(Wq.toFixed(2)),                   // minutos de espera promedio
        avgDeliveryTime: parseFloat(avgDeliveryTime.toFixed(2)) // tiempo promedio entrega
      }
    });
  } catch (error) {
    console.error('Error getQueueMetrics:', error);
    return res.status(500).json({ ok: false, message: 'Error al calcular métricas de cola' });
  }
};

// Función auxiliar para calcular factorial
function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Obtener datos para curva de crecimiento logístico
const getLogisticGrowth = async (req, res) => {
  try {
    // Obtener pedidos acumulados por día
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as daily_orders
      FROM orders
      WHERE status NOT IN ('cancelado')
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;
    
    const { rows } = await req.db.query(query);
    
    if (rows.length === 0) {
      return res.json({
        ok: true,
        data: {
          dates: [],
          actual: [],
          predicted: [],
          k: 0,
          alpha: 0,
          r_squared: 0
        }
      });
    }

    // Calcular pedidos acumulados
    let cumulative = 0;
    const dates = [];
    const actualData = [];
    
    rows.forEach(row => {
      cumulative += parseInt(row.daily_orders);
      dates.push(row.date);
      actualData.push(cumulative);
    });

    // Estimar parámetros del modelo logístico
    // k = capacidad máxima (estimamos como 1.5x el valor actual máximo)
    const maxCurrent = Math.max(...actualData);
    const k = maxCurrent * 1.5;

    // Calcular α (tasa de crecimiento) usando regresión no lineal simplificada
    // Usamos el punto medio de crecimiento para estimar α
    const n = actualData.length;
    const t0 = Math.floor(n / 2); // punto medio
    const y0 = actualData[t0];
    
    // α = (1/t) * ln((k - y0)/y0) aproximación
    let alpha = 0.1; // valor por defecto
    if (y0 > 0 && y0 < k) {
      alpha = Math.abs((1 / (t0 + 1)) * Math.log((k - y0) / y0));
    }

    // Generar curva predicha usando y(t) = k / (1 + e^(-α(t - t0)))
    const predictedData = [];
    for (let t = 0; t < n; t++) {
      const y = k / (1 + Math.exp(-alpha * (t - t0)));
      predictedData.push(parseFloat(y.toFixed(2)));
    }

    // Extender la predicción 30 días hacia el futuro
    const futureDays = 30;
    const futureDates = [];
    const futurePredicted = [];
    
    const lastDate = new Date(dates[dates.length - 1]);
    for (let i = 1; i <= futureDays; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      futureDates.push(futureDate.toISOString().split('T')[0]);
      
      const t = n + i - 1;
      const y = k / (1 + Math.exp(-alpha * (t - t0)));
      futurePredicted.push(parseFloat(y.toFixed(2)));
    }

    // Calcular R² (coeficiente de determinación)
    const yMean = actualData.reduce((a, b) => a + b, 0) / actualData.length;
    const ssTotal = actualData.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = actualData.reduce((sum, y, i) => sum + Math.pow(y - predictedData[i], 2), 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    return res.json({
      ok: true,
      data: {
        dates: dates,
        actual: actualData,
        predicted: predictedData,
        futureDates: futureDates,
        futurePredicted: futurePredicted,
        k: parseFloat(k.toFixed(2)),
        alpha: parseFloat(alpha.toFixed(4)),
        r_squared: parseFloat(rSquared.toFixed(4)),
        currentOrders: maxCurrent,
        daysTracked: n
      }
    });
  } catch (error) {
    console.error('Error getLogisticGrowth:', error);
    return res.status(500).json({ ok: false, message: 'Error al calcular crecimiento logístico' });
  }
};

// Incidencias del sistema - métricas y serie semanal
const getIncidentsDashboard = async (req, res) => {
  try {
    // Total incidencias del día
    const totalTodayQ = await req.db.query(`
      SELECT COUNT(*)::int AS total
      FROM incidencias
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // Tipos más comunes (últimos 7 días)
    const topTypesQ = await req.db.query(`
      SELECT type AS tipo, COUNT(*)::int AS total
      FROM incidencias
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY type
      ORDER BY total DESC
      LIMIT 5
    `);

    // Incidencias por tienda/restaurante (últimos 7 días)
    // Se asume columna restaurant_id en incidencias
    const byStoreQ = await req.db.query(`
      SELECT r.id, r.name AS restaurante, COUNT(i.*)::int AS total
      FROM incidencias i
      JOIN restaurants r ON r.id = i.restaurant_id
      WHERE i.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY r.id, r.name
      ORDER BY total DESC
      LIMIT 10
    `);

    // Tendencia semanal por día (últimos 7 días incluyendo hoy)
    const trendQ = await req.db.query(`
      WITH days AS (
        SELECT generate_series::date AS d
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day')
      )
      SELECT d AS date,
             COALESCE(
               (SELECT COUNT(*) FROM incidencias i WHERE DATE(i.created_at) = d), 0
             )::int AS total
      FROM days
      ORDER BY d ASC
    `);

    const totalToday = totalTodayQ.rows[0]?.total || 0;
    const topTypes = topTypesQ.rows || [];
    const byStore = byStoreQ.rows || [];
    const trend = trendQ.rows || [];

    return res.json({
      ok: true,
      data: {
        totalToday,
        topTypes,
        byStore,
        trend
      }
    });
  } catch (error) {
    console.error('Error getIncidentsDashboard:', error);
    return res.status(500).json({ ok: false, message: 'Error al obtener incidencias' });
  }
};

// Predicciones del sistema: Demanda, Saturación (M/M/c) y Riesgo de Incidencias
const getSystemPredictions = async (req, res) => {
  try {
    const horizonDays = parseInt(req.query.horizon || '14', 10); // días a proyectar

    // 1) Demanda histórica diaria y acumulada (para modelo logístico)
    const ordersDailyQ = await req.db.query(`
      SELECT DATE(created_at) AS date, COUNT(*)::int AS daily
      FROM orders
      WHERE status != 'cancelado'
      GROUP BY 1
      ORDER BY 1 ASC
    `);
    const dailyRows = ordersDailyQ.rows;
    if (!dailyRows.length) {
      return res.json({ ok: true, data: { horizonDays, predictedDemandDaily: [], saturationForecast: [], incidentsRisk: [], k: 0, alpha: 0 } });
    }

    let cumulative = 0;
    const datesHist = [];
    const dailyHist = [];
    const cumHist = [];
    for (const r of dailyRows) {
      cumulative += r.daily;
      datesHist.push(r.date);
      dailyHist.push(r.daily);
      cumHist.push(cumulative);
    }

    // Estimar k y alpha del modelo logístico (método simple usado antes)
    const maxCurrent = Math.max(...cumHist);
    const k = maxCurrent * 1.5;
    const n = cumHist.length;
    const t0 = Math.floor(n / 2);
    const y0 = cumHist[t0];
    let alpha = 0.1;
    if (y0 > 0 && y0 < k) {
      alpha = Math.abs((1 / (t0 + 1)) * Math.log((k - y0) / y0));
    }

    // Proyectar curva logística acumulada y derivar demanda diaria futura
    const futureDates = [];
    const predictedCumulative = [];
    const startDate = new Date(datesHist[datesHist.length - 1]);
    for (let i = 1; i <= horizonDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      futureDates.push(d.toISOString().split('T')[0]);
      const t = n + i - 1;
      const y = k / (1 + Math.exp(-alpha * (t - t0)));
      predictedCumulative.push(y);
    }
    // Demanda diaria proyectada = diff de acumulados (suavizado mínimo)
    const predictedDemandDaily = predictedCumulative.map((y, idx) => {
      const prev = idx === 0 ? cumHist[cumHist.length - 1] : predictedCumulative[idx - 1];
      return Math.max(0, y - prev);
    });

    // 2) Parámetros M/M/c actuales (mu y c), y lambda proyectada desde demanda diaria
    const muQ = await req.db.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - picked_up_at))/60) AS avg_delivery_time_minutes
      FROM orders
      WHERE status = 'entregado'
        AND picked_up_at IS NOT NULL
        AND delivered_at IS NOT NULL
        AND created_at >= NOW() - INTERVAL '14 days'
    `);
    const avgDeliveryTime = muQ.rows[0]?.avg_delivery_time_minutes || 30;
    const mu = avgDeliveryTime > 0 ? 1 / avgDeliveryTime : 0; // entregas/min por repartidor

    const cQ = await req.db.query(`
      SELECT COUNT(DISTINCT user_id)::int AS active_delivery_count
      FROM user_roles
      WHERE role = 'delivery'
    `);
    const c = cQ.rows[0]?.active_delivery_count || 1;

    // Convertir demanda diaria proyectada a lambda (por minuto)
    // Asumimos 12 horas operativas/día (720 min). Ajustable si se desea.
    const operationalMinutes = 12 * 60;
    const saturationForecast = futureDates.map((d, i) => {
      const lambda = operationalMinutes > 0 ? (predictedDemandDaily[i] / operationalMinutes) : 0;
      const rho = mu * c > 0 ? lambda / (mu * c) : 0;
      let level = 'normal';
      if (rho >= 1) level = 'saturado';
      else if (rho >= 0.9) level = 'alto';
      else if (rho >= 0.7) level = 'moderado';
      return { date: d, rho: parseFloat(rho.toFixed(4)), level };
    });

    // 3) Riesgo de incidencias usando tabla incidencias (tasa reciente * demanda proyectada)
    const incDailyQ = await req.db.query(`
      WITH recent_orders AS (
        SELECT DATE(created_at) AS date, COUNT(*)::int AS orders
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '14 days' AND status != 'cancelado'
        GROUP BY 1
      ), recent_incs AS (
        SELECT DATE(created_at) AS date, COUNT(*)::int AS incs
        FROM incidencias
        WHERE created_at >= NOW() - INTERVAL '14 days'
        GROUP BY 1
      )
      SELECT COALESCE(SUM(incs),0)::int AS incs_14d, COALESCE(SUM(orders),0)::int AS orders_14d
      FROM recent_orders ro FULL OUTER JOIN recent_incs ri ON ro.date = ri.date
    `);
    const inc14 = incDailyQ.rows[0]?.incs_14d || 0;
    const ord14 = incDailyQ.rows[0]?.orders_14d || 1;
    const incRate = inc14 / ord14; // incidencias por pedido

    const incidentsRisk = futureDates.map((d, i) => {
      const expectedInc = predictedDemandDaily[i] * incRate;
      let risk = 'bajo';
      const ratePct = incRate * 100;
      if (ratePct >= 5 || expectedInc >= 10) risk = 'alto';
      else if (ratePct >= 2 || expectedInc >= 5) risk = 'medio';
      return { date: d, expected: Math.round(expectedInc), risk, rate: parseFloat(ratePct.toFixed(2)) };
    });

    return res.json({
      ok: true,
      data: {
        horizonDays,
        futureDates,
        predictedDemandDaily: predictedDemandDaily.map(v => Math.round(v)),
        saturationForecast,
        incidentsRisk,
        k: parseFloat(k.toFixed(2)),
        alpha: parseFloat(alpha.toFixed(4)),
        mu: parseFloat(mu.toFixed(4)),
        c
      }
    });
  } catch (error) {
    console.error('Error getSystemPredictions:', error);
    return res.status(500).json({ ok: false, message: 'Error al generar predicciones' });
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
  getEcosystemModel,
  getQueueMetrics,
  getLogisticGrowth,
  getIncidentsDashboard,
  getSystemPredictions
};
