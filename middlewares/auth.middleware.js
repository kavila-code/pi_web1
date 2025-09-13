import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ ok: false, msg: "No token provided" });
    }

    // El header debe ser: "Bearer token_aqui"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ ok: false, msg: "Invalid token format" });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos el email del token en la request
    req.email = decoded.email;

    next(); // sigue al siguiente handler
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(403).json({ ok: false, msg: "Invalid or expired token" });
  }
};
