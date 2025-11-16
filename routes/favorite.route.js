import { Router } from 'express';
import {
  getUserFavorites,
  getFavoriteIds,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite
} from '../controllers/favorite.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.get('/favorites', authMiddleware, getUserFavorites);
router.get('/favorites/ids', authMiddleware, getFavoriteIds);
router.post('/favorites', authMiddleware, addToFavorites);
router.post('/favorites/toggle', authMiddleware, toggleFavorite);
router.delete('/favorites/:restaurantId', authMiddleware, removeFromFavorites);

export default router;
