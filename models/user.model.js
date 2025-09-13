import { db } from '../database/connection.database.js';

const create = async ({ email, password, username }) => {
  const query = {
    text: `
      INSERT INTO users (email, password, username)
      VALUES ($1, $2, $3)
      RETURNING uid, email, username
    `,
    values: [email, password, username],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

const findOneByEmail = async (email) => {
  const query = {
    text: `
      SELECT uid, email, username
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
      SELECT uid, email, username
      FROM users
      WHERE uid = $1
    `,
    values: [uid],
  };

  const { rows } = await db.query(query);
  return rows[0];
};

export const UserModel = {
  create,
  findOneByEmail,
  findOneByUid,
};
