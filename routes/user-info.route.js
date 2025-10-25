import { Router } from 'express';
import { UserInfoController } from '../controllers/user-info.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';
import { body, param } from 'express-validator';
import { validateFields } from '../middlewares/validate.middleware.js';

const router = Router();

// ===== VALIDACIONES =====

const userInfoValidation = [
  body('cedula')
    .trim()
    .notEmpty().withMessage('La cédula es requerida')
    .isLength({ min: 6, max: 30 }).withMessage('La cédula debe tener entre 6 y 30 caracteres'),
  
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 120 }).withMessage('El nombre debe tener entre 2 y 120 caracteres'),
  
  body('apellidos')
    .trim()
    .notEmpty().withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 120 }).withMessage('Los apellidos deben tener entre 2 y 120 caracteres'),
  
  body('direccion')
    .trim()
    .notEmpty().withMessage('La dirección es requerida')
    .isLength({ max: 200 }).withMessage('La dirección no debe exceder 200 caracteres'),
  
  body('municipio_id')
    .notEmpty().withMessage('El municipio es requerido')
    .toInt()
    .isInt({ min: 1 }).withMessage('El municipio debe ser un número válido mayor a 0'),
  
  body('departamento_id')
    .notEmpty().withMessage('El departamento es requerido')
    .toInt()
    .isInt({ min: 1 }).withMessage('El departamento debe ser un número válido mayor a 0'),
  
  body('telefono1')
    .trim()
    .notEmpty().withMessage('El teléfono 1 es requerido')
    .matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono 1 debe contener solo números y caracteres válidos')
    .isLength({ min: 7, max: 20 }).withMessage('El teléfono 1 debe tener entre 7 y 20 caracteres'),
  
  body('telefono2')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono 2 debe contener solo números y caracteres válidos')
    .isLength({ max: 20 }).withMessage('El teléfono 2 no debe exceder 20 caracteres'),
  
  validateFields
];

const userInfoUpdateValidation = [
  body('cedula')
    .optional()
    .trim()
    .isLength({ min: 6, max: 30 }).withMessage('La cédula debe tener entre 6 y 30 caracteres'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El nombre debe tener entre 2 y 120 caracteres'),
  
  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('Los apellidos deben tener entre 2 y 120 caracteres'),
  
  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La dirección no debe exceder 200 caracteres'),
  
  body('municipio_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El municipio_id debe ser un número válido'),
  
  body('departamento_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El departamento_id debe ser un número válido'),
  
  body('telefono1')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono 1 debe contener solo números y caracteres válidos')
    .isLength({ min: 7, max: 20 }).withMessage('El teléfono 1 debe tener entre 7 y 20 caracteres'),
  
  body('telefono2')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('El teléfono 2 debe contener solo números y caracteres válidos')
    .isLength({ max: 20 }).withMessage('El teléfono 2 no debe exceder 20 caracteres'),
  
  validateFields
];

// ===== RUTAS DEL USUARIO AUTENTICADO =====

/**
 * @route   GET /api/v1/user-info/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', authMiddleware, UserInfoController.getMyInfo);

/**
 * @route   POST /api/v1/user-info/me
 * @desc    Crear o actualizar información del usuario autenticado
 * @access  Private
 */
router.post('/me', authMiddleware, userInfoValidation, UserInfoController.upsertMyInfo);

/**
 * @route   PATCH /api/v1/user-info/me
 * @desc    Actualizar información parcial del usuario autenticado
 * @access  Private
 */
router.patch('/me', authMiddleware, userInfoUpdateValidation, UserInfoController.updateMyInfo);

/**
 * @route   DELETE /api/v1/user-info/me
 * @desc    Eliminar información del usuario autenticado
 * @access  Private
 */
router.delete('/me', authMiddleware, UserInfoController.deleteMyInfo);

/**
 * @route   GET /api/v1/user-info/me/complete
 * @desc    Verificar si el usuario tiene información completa
 * @access  Private
 */
router.get('/me/complete', authMiddleware, UserInfoController.checkComplete);

// ===== RUTAS ADMINISTRATIVAS =====

/**
 * @route   GET /api/v1/user-info/:uid
 * @desc    Obtener información de un usuario por uid
 * @access  Private/Admin
 */
router.get(
  '/:uid',
  authMiddleware,
  adminMiddleware,
  [
    param('uid').isInt({ min: 1 }).withMessage('UID inválido'),
    validateFields
  ],
  UserInfoController.getUserInfo
);

/**
 * @route   GET /api/v1/user-info/by-municipio/:municipio
 * @desc    Listar usuarios por municipio
 * @access  Private/Admin
 */
router.get(
  '/by-municipio/:municipio',
  authMiddleware,
  adminMiddleware,
  [
    param('municipio').trim().notEmpty().withMessage('Municipio requerido'),
    validateFields
  ],
  UserInfoController.getUsersByMunicipio
);

/**
 * @route   GET /api/v1/user-info/by-departamento/:departamento
 * @desc    Listar usuarios por departamento
 * @access  Private/Admin
 */
router.get(
  '/by-departamento/:departamento',
  authMiddleware,
  adminMiddleware,
  [
    param('departamento').trim().notEmpty().withMessage('Departamento requerido'),
    validateFields
  ],
  UserInfoController.getUsersByDepartamento
);

export default router;
