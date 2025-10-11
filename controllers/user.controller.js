import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';


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

    const token = jwt.sign(
      { uid: newUser.uid, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      ok: true,
      token,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, msg: "Missing required fields" });
    }

    const user = await UserModel.findOneByEmailWithPassword(email);
    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { uid: user.uid, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      ok: true,
      token,
      user: {
        uid: user.uid,
        email: user.email,
        username: user.username,
        role: user.role,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error(error);
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
        role: user.role,
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
  getDeliveryApplication
};

