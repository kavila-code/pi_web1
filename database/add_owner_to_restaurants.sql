-- Agregar columna owner_user_id a restaurants para vincular con el usuario creador
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS owner_user_id INTEGER REFERENCES users(uid) ON DELETE SET NULL;

-- Crear índice para búsquedas rápidas por propietario
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_user_id);

-- Comentario descriptivo
COMMENT ON COLUMN restaurants.owner_user_id IS 'Usuario que creó/es propietario del restaurante';
