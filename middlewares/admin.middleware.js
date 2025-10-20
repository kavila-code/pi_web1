export const adminMiddleware = (req, res, next) => {
  try {
    // Verificar si el usuario tiene rol de admin
    const roles = req.roles || [];
    
    if (!roles.includes('admin')) {
      return res.status(403).json({ 
        ok: false, 
        msg: "Access denied. Admin privileges required." 
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error.message);
    return res.status(500).json({ ok: false, msg: "Server error" });
  }
};