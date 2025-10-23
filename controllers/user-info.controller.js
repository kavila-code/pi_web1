import { UserInfoModel } from '../models/user-info.model.js';

/**
 * Controlador para gestionar información extendida de usuarios
 */

export const UserInfoController = {
  /**
   * Obtener información del usuario autenticado
   * GET /api/v1/user-info/me
   */
  async getMyInfo(req, res) {
    try {
      const uid = req.user.uid;
      const info = await UserInfoModel.findByUid(uid);

      if (!info) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró información adicional para este usuario'
        });
      }

      return res.json({
        success: true,
        data: info
      });
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener información del usuario'
      });
    }
  },

  /**
   * Crear o actualizar información del usuario autenticado
   * POST /api/v1/user-info/me
   */
  async upsertMyInfo(req, res) {
    try {
      const uid = req.user.uid;
      const {
        cedula,
        nombre,
        apellidos,
        direccion,
        municipio,
        departamento,
        telefono1,
        telefono2
      } = req.body;

      // Validar campos requeridos
      if (!cedula || !nombre || !apellidos || !telefono1 || !direccion || !municipio || !departamento) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: cédula, nombre, apellidos, dirección, municipio, departamento, teléfono1'
        });
      }

      // Verificar si la cédula ya existe para otro usuario
      const existingInfo = await UserInfoModel.findByCedula(cedula);
      if (existingInfo && existingInfo.uid !== uid) {
        return res.status(409).json({
          success: false,
          message: 'La cédula ya está registrada para otro usuario'
        });
      }

      const data = {
        uid,
        cedula,
        nombre,
        apellidos,
        direccion,
        municipio,
        departamento,
        telefono1,
        telefono2: telefono2 || null
      };

      const info = await UserInfoModel.upsert(data);

      return res.json({
        success: true,
        message: 'Información actualizada correctamente',
        data: info
      });
    } catch (error) {
      console.error('Error al actualizar información del usuario:', error);
      
      // Error de constraint único (cédula duplicada)
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'La cédula ya está registrada'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al actualizar información del usuario'
      });
    }
  },

  /**
   * Actualizar información parcial del usuario autenticado
   * PATCH /api/v1/user-info/me
   */
  async updateMyInfo(req, res) {
    try {
      const uid = req.user.uid;
      const updates = req.body;

      // Verificar que hay campos para actualizar
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
      }

      // Si se intenta cambiar la cédula, verificar que no exista
      if (updates.cedula) {
        const existingInfo = await UserInfoModel.findByCedula(updates.cedula);
        if (existingInfo && existingInfo.uid !== uid) {
          return res.status(409).json({
            success: false,
            message: 'La cédula ya está registrada para otro usuario'
          });
        }
      }

      const info = await UserInfoModel.update(uid, updates);

      if (!info) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró información para actualizar'
        });
      }

      return res.json({
        success: true,
        message: 'Información actualizada correctamente',
        data: info
      });
    } catch (error) {
      console.error('Error al actualizar información:', error);

      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'La cédula ya está registrada'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al actualizar información'
      });
    }
  },

  /**
   * Eliminar información del usuario autenticado
   * DELETE /api/v1/user-info/me
   */
  async deleteMyInfo(req, res) {
    try {
      const uid = req.user.uid;
      const deleted = await UserInfoModel.delete(uid);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró información para eliminar'
        });
      }

      return res.json({
        success: true,
        message: 'Información eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar información:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar información'
      });
    }
  },

  /**
   * Verificar si el usuario tiene información completa
   * GET /api/v1/user-info/me/complete
   */
  async checkComplete(req, res) {
    try {
      const uid = req.user.uid;
      const isComplete = await UserInfoModel.hasCompleteInfo(uid);

      return res.json({
        success: true,
        isComplete,
        message: isComplete 
          ? 'El perfil está completo' 
          : 'Faltan campos requeridos en el perfil'
      });
    } catch (error) {
      console.error('Error al verificar información:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar información'
      });
    }
  },

  // ===== ADMIN ENDPOINTS =====

  /**
   * Obtener información de un usuario por uid (solo admin)
   * GET /api/v1/user-info/:uid
   */
  async getUserInfo(req, res) {
    try {
      const { uid } = req.params;
      const info = await UserInfoModel.findByUid(parseInt(uid));

      if (!info) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró información para este usuario'
        });
      }

      return res.json({
        success: true,
        data: info
      });
    } catch (error) {
      console.error('Error al obtener información:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener información'
      });
    }
  },

  /**
   * Listar usuarios por municipio (solo admin)
   * GET /api/v1/user-info/by-municipio/:municipio
   */
  async getUsersByMunicipio(req, res) {
    try {
      const { municipio } = req.params;
      const users = await UserInfoModel.findByMunicipio(municipio);

      return res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      console.error('Error al buscar por municipio:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al buscar usuarios'
      });
    }
  },

  /**
   * Listar usuarios por departamento (solo admin)
   * GET /api/v1/user-info/by-departamento/:departamento
   */
  async getUsersByDepartamento(req, res) {
    try {
      const { departamento } = req.params;
      const users = await UserInfoModel.findByDepartamento(departamento);

      return res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      console.error('Error al buscar por departamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al buscar usuarios'
      });
    }
  }
};
