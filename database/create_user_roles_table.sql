-- Script para crear la tabla user_roles
-- Esta tabla permite que un usuario tenga múltiples roles (cliente, repartidor, admin)

CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'delivery', 'admin')),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, role)
);

-- Índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Migrar datos existentes (si la columna role aún existe en users)
-- INSERT INTO user_roles (user_id, role)
-- SELECT uid, role FROM users WHERE role IS NOT NULL
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Si no migraste los datos antes de eliminar la columna, 
-- necesitarás asignar el rol 'user' por defecto a todos los usuarios:
INSERT INTO user_roles (user_id, role)
SELECT uid, 'user' FROM users
WHERE uid NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id, role) DO NOTHING;
