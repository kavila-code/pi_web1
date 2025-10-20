// Middleware para verificar roles específicos
// Permite crear middlewares dinámicos para cualquier combinación de roles

/**
 * Crea un middleware que verifica si el usuario tiene al menos uno de los roles especificados
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRoles = req.roles || [];
      
      // Verificar si el usuario tiene al menos uno de los roles permitidos
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasPermission) {
        return res.status(403).json({ 
          ok: false, 
          msg: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error.message);
      return res.status(500).json({ ok: false, msg: "Server error" });
    }
  };
};

/**
 * Crea un middleware que verifica si el usuario tiene TODOS los roles especificados
 * @param {string[]} requiredRoles - Array de roles requeridos
 * @returns {Function} Middleware function
 */
export const requireAllRoles = (requiredRoles) => {
  return (req, res, next) => {
    try {
      const userRoles = req.roles || [];
      
      // Verificar si el usuario tiene todos los roles requeridos
      const hasAllRoles = requiredRoles.every(role => userRoles.includes(role));
      
      if (!hasAllRoles) {
        return res.status(403).json({ 
          ok: false, 
          msg: `Access denied. All these roles are required: ${requiredRoles.join(', ')}` 
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error.message);
      return res.status(500).json({ ok: false, msg: "Server error" });
    }
  };
};

// Middlewares específicos para cada rol
export const requireAdmin = requireRole(['admin']);
export const requireDelivery = requireRole(['delivery']);
export const requireUser = requireRole(['user']);
export const requireDeliveryOrAdmin = requireRole(['delivery', 'admin']);
