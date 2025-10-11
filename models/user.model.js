import { db } from '../database/connection.database.js';

const create = async ({ username, email, password, role }) => {
  const query = {
    text: `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING uid, username, email, role, created_at
    `,
    values: [username, email, password, role || 'user'],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

const findOneByEmail = async (email) => {
  const query = {
    text: `
      SELECT uid, username, email, role, created_at
      FROM users
      WHERE email = $1
    `,
    values: [email],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

const findOneByUid = async (uid) => {
  const query = {
    text: `
      SELECT uid, username, email, role, created_at
      FROM users
      WHERE uid = $1
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
      SELECT uid, username, email, password, role, created_at
      FROM users
      WHERE email = $1
    `,
    values: [email],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

export const UserModel = {
  create,
  findOneByEmail,
  findOneByEmailWithPassword,
  findOneByUid,
};
