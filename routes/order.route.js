import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  getAvailableOrders,
  getMyDeliveries,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryPerson,
  cancelOrder,
  addReview,
  getOrderStats,
} from '../controllers/order.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para clientes
router.post('/orders', createOrder); // Crear pedido
router.get('/orders/my-orders', getMyOrders); // Mis pedidos
router.get('/orders/:id', getOrderById); // Ver detalle
router.post('/orders/:id/cancel', cancelOrder); // Cancelar pedido
router.post('/orders/:id/review', addReview); // Calificar pedido

// Rutas para domiciliarios
router.get('/orders/available', getAvailableOrders); // Pedidos disponibles
router.get('/orders/my-deliveries', getMyDeliveries); // Mis entregas
router.post('/orders/:id/assign', assignDeliveryPerson); // Aceptar pedido
router.put('/orders/:id/status', updateOrderStatus); // Actualizar estado

// Rutas para admin
router.get('/admin/orders', adminMiddleware, getAllOrders); // Todos los pedidos
router.get('/admin/orders/stats', adminMiddleware, getOrderStats); // Estadísticas
router.get('/admin/restaurants/:restaurantId/orders', adminMiddleware, getRestaurantOrders); // Por restaurante

export default router;
