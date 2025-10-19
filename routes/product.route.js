import { Router } from 'express';
import {
  getProductsByRestaurant,
  getProductById,
  getProductsByIds,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoriesByRestaurant,
} from '../controllers/product.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/restaurants/:restaurantId/products', getProductsByRestaurant);
router.get('/restaurants/:restaurantId/products/categories', getCategoriesByRestaurant);
router.get('/products/:id', getProductById);
router.post('/products/batch', getProductsByIds); // Para carrito

// Rutas protegidas (solo admin)
router.post('/products', authMiddleware, adminMiddleware, createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
