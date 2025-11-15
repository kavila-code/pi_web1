import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { OrderModel } from '../models/order.model.js';
import { db } from '../database/connection.database.js';


// ---------------------- Controladores ----------------------

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ ok: false, msg: "Missing required fields" });
    }

    const existingUser = await UserModel.findOneByEmail(email);
    if (existingUser) {
      return res.status(409).json({ ok: false, msg: "Email already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await UserModel.create({ username, email, password: hashedPassword, role });

    // Obtener el usuario completo con roles
    const userWithRoles = await UserModel.findOneByUid(newUser.uid);

    const token = jwt.sign(
      { uid: userWithRoles.uid, email: userWithRoles.email, roles: userWithRoles.roles || ['user'] },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      ok: true,
      token,
      user: {
        uid: userWithRoles.uid,
        email: userWithRoles.email,
        username: userWithRoles.username,
        roles: userWithRoles.roles || ['user'],
        created_at: userWithRoles.created_at
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    console.log('📝 Login request received:', { email: req.body.email }); // Debug log
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing fields'); // Debug log
      return res.status(400).json({ ok: false, msg: "Missing required fields" });
    }

    console.log('🔍 Finding user...'); // Debug log
    const user = await UserModel.findOneByEmailWithPassword(email);
    
    if (!user) {
      console.log('❌ User not found'); // Debug log
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    console.log('✅ User found:', { uid: user.uid, email: user.email, roles: user.roles }); // Debug log

    console.log('🔐 Comparing passwords...'); // Debug log
    const isMatch = await bcryptjs.compare(password, user.password);
    
    if (!isMatch) {
      console.log('❌ Invalid password'); // Debug log
      return res.status(401).json({ ok: false, msg: "Invalid credentials" });
    }

    console.log('✅ Password valid'); // Debug log
    console.log('🎫 Generating token...'); // Debug log

    const token = jwt.sign(
      { uid: user.uid, email: user.email, roles: user.roles || ['user'] },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Token generated successfully'); // Debug log

    return res.json({
      ok: true,
      token,
      user: {
        uid: user.uid,
        email: user.email,
        username: user.username,
        roles: user.roles || ['user'],
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message); // Improved error log
    console.error('Stack:', error.stack); // Full stack trace
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

const profile = async (req, res) => {
  try {
    const user = await UserModel.findOneByEmail(req.email); // req.email viene del middleware JWT

    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    return res.json({
      ok: true,
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        roles: user.roles || ['user'],
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Aplicación para ser repartidor
const applyDelivery = async (req, res) => {
  try {
    // Aquí implementarías la lógica para guardar la aplicación
    // Por ahora simulamos que se guarda exitosamente
    
    const applicationData = {
      user_id: req.uid,
      full_name: req.body.fullName,
      id_number: req.body.idNumber,
      phone: req.body.phone,
      birth_date: req.body.birthDate,
      address: req.body.address,
      vehicle_type: req.body.vehicleType,
      vehicle_plate: req.body.vehiclePlate,
      vehicle_brand: req.body.vehicleBrand,
      vehicle_model: req.body.vehicleModel,
      experience: req.body.experience,
      status: 'pending',
      created_at: new Date()
    };

    // En una implementación real, guardarías esto en la base de datos
    console.log('Delivery application received:', applicationData);

    return res.json({
      ok: true,
      msg: 'Application submitted successfully',
      application: {
        id: Date.now(), // ID temporal
        status: 'pending',
        created_at: applicationData.created_at
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

// Obtener estado de aplicación de delivery
const getDeliveryApplication = async (req, res) => {
  try {
    // Aquí buscarías en la base de datos la aplicación del usuario
    // Por ahora devolvemos un estado mock
    
    const application = {
      id: 1,
      user_id: req.uid,
      status: 'pending', // pending, approved, rejected
      full_name: 'Usuario Ejemplo',
      vehicle_type: 'motorcycle',
      created_at: new Date(),
      updated_at: new Date()
    };

    return res.json({
      ok: true,
      application
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

export const UserController = {
  register,
  login,
  profile,
  applyDelivery,
  getDeliveryApplication,
  async getMyStats(req, res) {
    try {
      const uid = req.user?.uid || req.uid;
      if (!uid) {
        return res.status(401).json({ ok: false, msg: 'Unauthorized' });
      }

      const stats = await OrderModel.getUserStats(uid);
      return res.json({ ok: true, data: stats });
    } catch (error) {
      console.error('Error obteniendo estadísticas de usuario:', error);
      return res.status(500).json({ ok: false, msg: 'Server error' });
    }
  }
  ,
  async getMyFavorites(req, res) {
    try {
      const uid = req.user?.uid || req.uid;
      if (!uid) {
        return res.status(401).json({ ok: false, msg: 'Unauthorized' });
      }

      const { rows } = await req.db.query({
        text: `
          SELECT r.id, r.name, r.logo_url, r.cover_image_url, r.category,
                 COALESCE(AVG(o.rating), 0) AS rating,
                 COUNT(*) AS orders_count
          FROM orders o
          JOIN restaurants r ON r.id = o.restaurant_id
          WHERE o.customer_id = $1 AND o.status = 'entregado'
          GROUP BY r.id, r.name, r.logo_url, r.cover_image_url, r.category
          ORDER BY orders_count DESC, r.name ASC
          LIMIT 12
        `,
        values: [uid],
      });

      // Responder como arreglo directo para compatibilidad con el frontend actual
      return res.json(rows);
    } catch (error) {
      console.error('Error obteniendo favoritos:', error);
      return res.status(500).json({ ok: false, msg: 'Server error' });
    }
  }
};

