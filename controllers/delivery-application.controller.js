import DeliveryApplicationModel from '../models/delivery-application.model.js';

class DeliveryApplicationController {
  // Crear solicitud de domiciliario
  static async createApplication(req, res) {
    try {
      console.log('req.user:', req.user); // Debug log
      console.log('req headers:', req.headers.authorization); // Debug log
      
      const userId = req.user.uid; // Usar uid en lugar de id

      // Verificar que el usuario no sea ya domiciliario o admin
      if (req.user.role === 'domiciliario') {
        return res.status(400).json({
          success: false,
          message: 'Ya eres domiciliario'
        });
      }

      if (req.user.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Los administradores no pueden solicitar ser domiciliarios'
        });
      }

      const application = await DeliveryApplicationModel.create(userId);

      res.status(201).json({
        success: true,
        message: 'Solicitud enviada exitosamente',
        data: application
      });
    } catch (error) {
      console.error('Error creating delivery application:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener estado de solicitud del usuario
  static async getUserApplication(req, res) {
    try {
      const userId = req.user.uid; // Usar uid en lugar de id
      const application = await DeliveryApplicationModel.getByUserId(userId);

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error getting user application:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener todas las solicitudes (solo admin)
  static async getAllApplications(req, res) {
    try {
      const { status } = req.query;
      const applications = await DeliveryApplicationModel.getAll(status);

      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error getting all applications:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener solicitud por ID (solo admin)
  static async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const application = await DeliveryApplicationModel.getById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error getting application by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar estado de solicitud (solo admin)
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, observaciones } = req.body;
      const adminId = req.user.uid; // Usar uid en lugar de id

      // Validar status
      if (!['aprobada', 'rechazada'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser "aprobada" o "rechazada"'
        });
      }

      const application = await DeliveryApplicationModel.updateStatus(
        id, 
        status, 
        observaciones || null, 
        adminId
      );

      res.json({
        success: true,
        message: `Solicitud ${status} exitosamente`,
        data: application
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas (solo admin)
  static async getApplicationStats(req, res) {
    try {
      const stats = await DeliveryApplicationModel.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting application stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar solicitud (solo admin)
  static async deleteApplication(req, res) {
    try {
      const { id } = req.params;
      const application = await DeliveryApplicationModel.delete(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Solicitud eliminada exitosamente',
        data: application
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default DeliveryApplicationController;