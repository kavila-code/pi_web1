import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection.database.js';


// Modelo simple para PostgreSQL sin ORM
export const UserModel = {
  async findOneByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await db.query(query, [email]); // ← Cambiado pool → db
    return rows[0];
  },

  async create({ username, email, password, role }) {
    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING uid, username, email, role, created_at
    `;
    const values = [username, email, password, role || 'user'];
    const { rows } = await db.query(query, values); // ← Cambiado pool → db
    return rows[0];
  }
};

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

    const user = await UserModel.findOneByEmail(email);
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

export const UserController = {
  register,
  login,
  profile
};

