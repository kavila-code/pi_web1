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
router.get("/dashboard/popular-restaurants", AdminController.getPopularRestaurantsToday);
router.get("/dashboard/ecosystem-model", AdminController.getEcosystemModel);

// Users management
router.get("/users", AdminController.getUsers);
router.get("/users/:id", AdminController.getUserById);
router.put("/users/:id", AdminController.updateUser);

// Orders management
router.get("/orders", AdminController.getOrders);

// Restaurants management
router.get("/restaurants", AdminController.getRestaurants);
router.patch("/restaurants/:id/approve", AdminController.approveRestaurant);
router.patch("/restaurants/:id/deactivate", AdminController.deactivateRestaurant);

export default router;