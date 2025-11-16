import { Router } from 'express';
import {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  applyRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getCategories,
  getRecommended,
} from '../controllers/restaurant.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';
import { uploadRestaurantLogo } from '../middlewares/file-upload.middleware.js';

const router = Router();

// Rutas públicas (sin autenticación)
// Soporta JSON o multipart/form-data con campo restaurant_logo
router.post('/restaurants/apply', (req, res, next) => {
  // Detectar multipart para aplicar middleware de subida
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    uploadRestaurantLogo(req, res, function(err) {
      if (err) return res.status(400).json({ ok:false, message: err.message });
      next();
    });
  } else {
    next();
  }
}, applyRestaurant);
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/categories', getCategories);
router.get('/restaurants/recommended', getRecommended);
router.get('/restaurants/:id', getRestaurantById);

// Rutas protegidas (solo admin)
router.post('/restaurants', authMiddleware, adminMiddleware, createRestaurant);
router.put('/restaurants/:id', authMiddleware, adminMiddleware, updateRestaurant);
router.delete('/restaurants/:id', authMiddleware, adminMiddleware, deleteRestaurant);

export default router;
