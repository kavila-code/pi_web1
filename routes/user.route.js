import { Router } from "express";
import { body } from "express-validator";
import { UserController } from "../controllers/user.controller.js";
import { validateFields } from "../middlewares/validate.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// ✅ Register con validaciones
router.post(
  "/register",
  [
    body("username", "Username is required").notEmpty(),
    body("email", "Valid email is required").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
    validateFields
  ],
  UserController.register
);

// ✅ Login con validaciones
router.post(
  "/login",
  [
    body("email", "Valid email is required").isEmail(),
    body("password", "Password is required").notEmpty(),
    validateFields
  ],
  UserController.login
);

// ✅ Profile protegido con middleware
router.get("/profile", authMiddleware, UserController.profile);

// ✅ Estadísticas del usuario autenticado
router.get("/me/stats", authMiddleware, UserController.getMyStats);

// ✅ Aplicación para delivery
router.post("/apply-delivery", authMiddleware, UserController.applyDelivery);

// ✅ Obtener estado de aplicación de delivery
router.get("/delivery-application", authMiddleware, UserController.getDeliveryApplication);
// ✅ Favoritos del usuario (basado en pedidos entregados)
router.get("/favorites", authMiddleware, UserController.getMyFavorites);

export default router;
