import { Router } from 'express';
import DeliveryApplicationController from '../controllers/delivery-application.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = Router();

// Rutas para usuarios
router.post('/apply', 
  authMiddleware, 
  DeliveryApplicationController.createApplication
);

router.get('/my-application', 
  authMiddleware, 
  DeliveryApplicationController.getUserApplication
);

// Rutas para administradores
router.get('/all', 
  authMiddleware, 
  adminMiddleware, 
  DeliveryApplicationController.getAllApplications
);

router.get('/stats', 
  authMiddleware, 
  adminMiddleware, 
  DeliveryApplicationController.getApplicationStats
);

router.get('/:id', 
  authMiddleware, 
  adminMiddleware, 
  DeliveryApplicationController.getApplicationById
);

router.put('/:id/status', 
  authMiddleware, 
  adminMiddleware, 
  DeliveryApplicationController.updateApplicationStatus
);

router.delete('/:id', 
  authMiddleware, 
  adminMiddleware, 
  DeliveryApplicationController.deleteApplication
);

export default router;