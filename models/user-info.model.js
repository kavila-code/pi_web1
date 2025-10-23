import { db } from '../database/connection.database.js';

/**
 * Modelo para la tabla user_details (antes user_info)
 * Gestiona información extendida de usuarios (clientes y domiciliarios)
 */

export const UserInfoModel = {
  /**
   * Crear o actualizar información del usuario
   * @param {Object} data - { uid, cedula, nombre, apellidos, direccion, municipio, departamento, telefono1, telefono2 }
   * @returns {Promise<Object>} Registro creado/actualizado
   */
  async upsert(data) {
    const {
      uid,
      cedula,
      nombre,
      apellidos,
      direccion,
      municipio,
      departamento,
      telefono1,
      telefono2
    } = data;

    // Estrategia: si existe registro por user_id, actualizar; si no, insertar
    const existing = await db.query('SELECT id FROM user_details WHERE user_id = $1', [uid]);

    if (existing.rows.length > 0) {
      const updateQuery = `
        UPDATE user_details
        SET 
          cedula = $1,
          nombre = $2,
          apellidos = $3,
          direccion = $4,
          municipio = $5,
          departamento = $6,
          telefono1 = $7,
          telefono2 = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $9
        RETURNING *;
      `;
      const { rows } = await db.query(updateQuery, [
        cedula,
        nombre,
        apellidos,
        direccion,
        municipio,
        departamento,
        telefono1,
        telefono2,
        uid
      ]);
      return rows[0];
    } else {
      const insertQuery = `
        INSERT INTO user_details (
          user_id, cedula, nombre, apellidos, direccion,
          municipio, departamento, telefono1, telefono2
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const { rows } = await db.query(insertQuery, [
        uid,
        cedula,
        nombre,
        apellidos,
        direccion,
        municipio,
        departamento,
        telefono1,
        telefono2
      ]);
      return rows[0];
    }
  },

  /**
   * Obtener información de un usuario por uid
   * @param {number} uid - ID del usuario
   * @returns {Promise<Object|null>}
   */
  async findByUid(uid) {
    const query = 'SELECT * FROM user_details WHERE user_id = $1';
    const { rows } = await db.query(query, [uid]);
    return rows[0] || null;
  },

  /**
   * Obtener información de un usuario por cédula
   * @param {string} cedula - Cédula del usuario
   * @returns {Promise<Object|null>}
   */
  async findByCedula(cedula) {
    const query = 'SELECT * FROM user_details WHERE cedula = $1';
    const { rows } = await db.query(query, [cedula]);
    return rows[0] || null;
  },

  /**
   * Actualizar información del usuario (campos parciales)
   * @param {number} uid - ID del usuario
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object|null>}
   */
  async update(uid, updates) {
    const allowedFields = [
      'cedula',
      'nombre',
      'apellidos',
      'direccion',
      'municipio',
      'departamento',
      'telefono1',
      'telefono2'
    ];

    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(uid);

    const query = `
      UPDATE user_details 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },

  /**
   * Eliminar información del usuario
   * @param {number} uid - ID del usuario
   * @returns {Promise<boolean>}
   */
  async delete(uid) {
    const query = 'DELETE FROM user_details WHERE user_id = $1 RETURNING id';
    const { rows } = await db.query(query, [uid]);
    return rows.length > 0;
  },

  /**
   * Listar usuarios por municipio
   * @param {string} municipio - Nombre del municipio
   * @returns {Promise<Array>}
   */
  async findByMunicipio(municipio) {
    const query = `
      SELECT ui.*, u.email, u.username 
      FROM user_details ui
      INNER JOIN users u ON ui.user_id = u.uid
      WHERE ui.municipio ILIKE $1
      ORDER BY ui.apellidos, ui.nombre
    `;
    const { rows } = await db.query(query, [`%${municipio}%`]);
    return rows;
  },

  /**
   * Listar usuarios por departamento
   * @param {string} departamento - Nombre del departamento
   * @returns {Promise<Array>}
   */
  async findByDepartamento(departamento) {
    const query = `
      SELECT ui.*, u.email, u.username 
      FROM user_details ui
      INNER JOIN users u ON ui.user_id = u.uid
      WHERE ui.departamento ILIKE $1
      ORDER BY ui.apellidos, ui.nombre
    `;
    const { rows } = await db.query(query, [`%${departamento}%`]);
    return rows;
  },

  /**
   * Verificar si un usuario tiene información completa
   * @param {number} uid - ID del usuario
   * @returns {Promise<boolean>}
   */
  async hasCompleteInfo(uid) {
    const info = await this.findByUid(uid);
    if (!info) return false;

    const requiredFields = ['cedula', 'nombre', 'apellidos', 'direccion', 'municipio', 'departamento', 'telefono1'];
    return requiredFields.every(field => info[field] && info[field].trim() !== '');
  }
};
