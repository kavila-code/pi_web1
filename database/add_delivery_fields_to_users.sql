-- Agregar campos de perfil de domiciliario a la tabla users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS document_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS has_license BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS work_zones TEXT[],
  ADD COLUMN IF NOT EXISTS availability_schedule JSONB,
  ADD COLUMN IF NOT EXISTS previous_experience TEXT,
  ADD COLUMN IF NOT EXISTS why_delivery TEXT,
  ADD COLUMN IF NOT EXISTS customer_service_experience TEXT,
  ADD COLUMN IF NOT EXISTS cv_file_path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS id_document_path VARCHAR(500),
  ADD COLUMN IF NOT EXISTS license_photo_path VARCHAR(500);

-- Índices útiles (opcional)
CREATE INDEX IF NOT EXISTS idx_users_vehicle_type ON users(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);