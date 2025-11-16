import { Router } from 'express';
import {
  getProductsByRestaurant,
  getProductById,
  getProductsByIds,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoriesByRestaurant,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
} from '../controllers/product.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';
import { uploadProductImage } from '../middlewares/file-upload.middleware.js';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/restaurants/:restaurantId/products', getProductsByRestaurant);
router.get('/restaurants/:restaurantId/products/categories', getCategoriesByRestaurant);
router.get('/products/:id', getProductById);
router.post('/products/batch', getProductsByIds); // Para carrito

// Rutas de propietarios de restaurantes (autenticados)
router.post('/my-restaurants/:restaurantId/products', authMiddleware, uploadProductImage, createMyProduct);
router.put('/my-restaurants/:restaurantId/products/:productId', authMiddleware, uploadProductImage, updateMyProduct);
router.delete('/my-restaurants/:restaurantId/products/:productId', authMiddleware, deleteMyProduct);

// Rutas protegidas (solo admin)
router.post('/products', authMiddleware, adminMiddleware, createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, deleteProduct);

export default router;
