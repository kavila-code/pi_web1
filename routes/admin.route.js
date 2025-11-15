import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación y privilegios de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard statistics
router.get("/dashboard/stats", AdminController.getDashboardStats);
router.get("/dashboard/orders-by-day", AdminController.getOrdersByDay);

// Users management
router.get("/users", AdminController.getUsers);
router.get("/users/:id", AdminController.getUserById);
router.put("/users/:id", AdminController.updateUser);

// Orders management
router.get("/orders", AdminController.getOrders);

// Restaurants management
router.get("/restaurants", AdminController.getRestaurants);

export default router;