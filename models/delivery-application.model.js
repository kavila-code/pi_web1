import { db as pool } from '../database/connection.database.js';

class DeliveryApplicationModel {
  // Crear nueva solicitud con información extendida
  static async create(userId, applicationData = {}) {
    try {
      // Verificar si ya existe una solicitud activa
      const existingQuery = `
        SELECT id, status FROM delivery_applications 
        WHERE user_id = $1 AND status IN ('pendiente', 'aprobada')
      `;
      const existing = await pool.query(existingQuery, [userId]);
      
      if (existing.rows.length > 0) {
        const status = existing.rows[0].status;
        if (status === 'pendiente') {
          throw new Error('Ya tienes una solicitud pendiente');
        } else if (status === 'aprobada') {
          throw new Error('Tu solicitud ya fue aprobada');
        }
      }

      // Si no hay datos adicionales, crear solicitud básica (compatibilidad)
      if (Object.keys(applicationData).length === 0) {
        const query = `
          INSERT INTO delivery_applications (user_id)
          VALUES ($1)
          RETURNING *
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
      }

      // Crear solicitud con datos completos
      const {
        fullName,
        phone,
        address,
        birthDate,
        documentId,
        vehicleType,
        hasLicense,
        licenseNumber,
        workZones,
        availabilitySchedule,
        previousExperience,
        whyDelivery,
        customerServiceExperience,
        cvFilePath,
        idDocumentPath,
        licensePhotoPath
      } = applicationData;

      const query = `
        INSERT INTO delivery_applications (
          user_id, full_name, phone, address, birth_date, document_id,
          vehicle_type, has_license, license_number, work_zones, availability_schedule,
          previous_experience, why_delivery, customer_service_experience,
          cv_file_path, id_document_path, license_photo_path
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
        RETURNING *
      `;
      
      const values = [
        userId, fullName, phone, address, birthDate, documentId,
        vehicleType, hasLicense, licenseNumber, workZones, 
        availabilitySchedule ? JSON.stringify(availabilitySchedule) : null, 
        previousExperience, whyDelivery, customerServiceExperience, 
        cvFilePath, idDocumentPath, licensePhotoPath
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener solicitud por usuario
  static async getByUserId(userId) {
    try {
      const query = `
        SELECT da.*, u.username as nombre, u.email
        FROM delivery_applications da
        JOIN users u ON da.user_id = u.uid
        WHERE da.user_id = $1
        ORDER BY da.fecha_solicitud DESC
        LIMIT 1
      `;
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las solicitudes (para admin)
  static async getAll(status = null) {
    try {
      let query = `
        SELECT 
          da.*,
          u.username as nombre,
          u.email,
          admin_u.username as admin_nombre
        FROM delivery_applications da
        JOIN users u ON da.user_id = u.uid
        LEFT JOIN users admin_u ON da.admin_id = admin_u.uid
      `;
      
      const values = [];
      if (status) {
        query += ' WHERE da.status = $1';
        values.push(status);
      }
      
      query += ' ORDER BY da.fecha_solicitud DESC';
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener solicitud por ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          da.*,
          u.username as nombre,
          u.email,
          admin_u.username as admin_nombre
        FROM delivery_applications da
        JOIN users u ON da.user_id = u.uid
        LEFT JOIN users admin_u ON da.admin_id = admin_u.uid
        WHERE da.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar estado de solicitud
  static async updateStatus(id, status, observaciones, adminId) {
    try {
      const query = `
        UPDATE delivery_applications 
        SET 
          status = $1,
          observaciones = $2,
          admin_id = $3,
          fecha_revision = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;
      const result = await pool.query(query, [status, observaciones, adminId, id]);
      
      if (result.rows.length === 0) {
        throw new Error('Solicitud no encontrada');
      }

      // Si la solicitud es aprobada, actualizar el rol del usuario
      if (status === 'aprobada') {
        const updateUserQuery = `
          UPDATE users 
          SET role = 'domiciliario', updated_at = CURRENT_TIMESTAMP
          WHERE uid = (SELECT user_id FROM delivery_applications WHERE id = $1)
        `;
        await pool.query(updateUserQuery, [id]);
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas para el admin
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN status = 'aprobada' THEN 1 END) as aprobadas,
          COUNT(CASE WHEN status = 'rechazada' THEN 1 END) as rechazadas
        FROM delivery_applications
      `;
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Eliminar solicitud
  static async delete(id) {
    try {
      const query = `DELETE FROM delivery_applications WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

export default DeliveryApplicationModel;