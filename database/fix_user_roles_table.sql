-- Actualizar tabla user_roles para agregar columnas faltantes

-- Agregar columna assigned_at
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Agregar columna is_active
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Actualizar registros existentes
UPDATE user_roles 
SET assigned_at = CURRENT_TIMESTAMP, is_active = TRUE 
WHERE assigned_at IS NULL OR is_active IS NULL;

-- Agregar constraint UNIQUE si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE(user_id, role);
  END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Verificar la estructura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;
