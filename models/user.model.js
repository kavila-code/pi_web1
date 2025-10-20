import { db } from '../database/connection.database.js';

const create = async ({ username, email, password, role }) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Crear el usuario
    const userQuery = {
      text: `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING uid, username, email, created_at
      `,
      values: [username, email, password],
    };
    
    const { rows: userRows } = await client.query(userQuery);
    const user = userRows[0];
    
    // Asignar el rol por defecto
    const roleQuery = {
      text: `
        INSERT INTO user_roles (user_id, role)
        VALUES ($1, $2)
        RETURNING role
      `,
      values: [user.uid, role || 'user'],
    };
    
    await client.query(roleQuery);
    
    await client.query('COMMIT');
    return user;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const findOneByEmail = async (email) => {
  const query = {
    text: `
      SELECT 
        u.uid, 
        u.username, 
        u.email, 
        u.created_at,
        ARRAY_AGG(ur.role) FILTER (WHERE ur.is_active = true) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.uid = ur.user_id
      WHERE u.email = $1
      GROUP BY u.uid, u.username, u.email, u.created_at
    `,
    values: [email],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

const findOneByUid = async (uid) => {
  const query = {
    text: `
      SELECT 
        u.uid, 
        u.username, 
        u.email, 
        u.created_at,
        ARRAY_AGG(ur.role) FILTER (WHERE ur.is_active = true) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.uid = ur.user_id
      WHERE u.uid = $1
      GROUP BY u.uid, u.username, u.email, u.created_at
    `,
    values: [uid],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Método específico para login que incluye password
const findOneByEmailWithPassword = async (email) => {
  const query = {
    text: `
      SELECT 
        u.uid, 
        u.username, 
        u.email, 
        u.password, 
        u.created_at,
        ARRAY_AGG(ur.role) FILTER (WHERE ur.is_active = true) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.uid = ur.user_id
      WHERE u.email = $1
      GROUP BY u.uid, u.username, u.email, u.password, u.created_at
    `,
    values: [email],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Agregar un rol a un usuario
const addRole = async (userId, role) => {
  const query = {
    text: `
      INSERT INTO user_roles (user_id, role)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role) 
      DO UPDATE SET is_active = true, assigned_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
    values: [userId, role],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Remover un rol de un usuario
const removeRole = async (userId, role) => {
  const query = {
    text: `
      UPDATE user_roles 
      SET is_active = false 
      WHERE user_id = $1 AND role = $2
      RETURNING *
    `,
    values: [userId, role],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

// Verificar si un usuario tiene un rol específico
const hasRole = async (userId, role) => {
  const query = {
    text: `
      SELECT EXISTS(
        SELECT 1 FROM user_roles 
        WHERE user_id = $1 AND role = $2 AND is_active = true
      ) as has_role
    `,
    values: [userId, role],
  };

  const { rows } = await db.query(query);
  return rows[0].has_role;
};

export const UserModel = {
  create,
  findOneByEmail,
  findOneByEmailWithPassword,
  findOneByUid,
  addRole,
  removeRole,
  hasRole,
};
