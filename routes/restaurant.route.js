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

const router = Router();

// Rutas públicas (sin autenticación)
router.post('/restaurants/apply', applyRestaurant);
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/categories', getCategories);
router.get('/restaurants/recommended', getRecommended);
router.get('/restaurants/:id', getRestaurantById);

// Rutas protegidas (solo admin)
router.post('/restaurants', authMiddleware, adminMiddleware, createRestaurant);
router.put('/restaurants/:id', authMiddleware, adminMiddleware, updateRestaurant);
router.delete('/restaurants/:id', authMiddleware, adminMiddleware, deleteRestaurant);

export default router;
