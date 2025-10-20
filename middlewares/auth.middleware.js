import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader ? 'Header exists' : 'No header'); // Debug log
    
    if (!authHeader) {
      return res.status(401).json({ ok: false, msg: "No token provided" });
    }

    // El header debe ser: "Bearer token_aqui"
    const token = authHeader.split(" ")[1];
    console.log('Token extracted:', token ? 'Token exists' : 'No token'); // Debug log
    
    if (!token) {
      return res.status(401).json({ ok: false, msg: "Invalid token format" });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    // Guardamos los datos del usuario en req.user
    req.user = {
      email: decoded.email,
      roles: decoded.roles || ['user'], // Array de roles
      uid: decoded.uid
    };

    // También mantenemos las propiedades directas por compatibilidad
    req.email = decoded.email;
    req.roles = decoded.roles || ['user'];
    req.uid = decoded.uid;

    console.log('req.user created:', req.user); // Debug log

    next(); // sigue al siguiente handler
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(403).json({ ok: false, msg: "Invalid or expired token" });
  }
};
