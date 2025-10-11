-- Actualización de la tabla delivery_applications para incluir más campos

-- Agregar nuevas columnas a la tabla existente
ALTER TABLE delivery_applications 
ADD COLUMN full_name VARCHAR(255),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN address TEXT,
ADD COLUMN birth_date DATE,
ADD COLUMN document_id VARCHAR(50),
ADD COLUMN vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('bicicleta', 'moto', 'carro', 'a_pie')),
ADD COLUMN has_license BOOLEAN DEFAULT FALSE,
ADD COLUMN license_number VARCHAR(50),
ADD COLUMN work_zones TEXT[], -- Array de zonas de trabajo
ADD COLUMN availability_schedule JSONB, -- Horarios disponibles en formato JSON
ADD COLUMN previous_experience TEXT,
ADD COLUMN why_delivery TEXT,
ADD COLUMN customer_service_experience TEXT,
ADD COLUMN cv_file_path VARCHAR(500), -- Ruta del archivo CV
ADD COLUMN id_document_path VARCHAR(500), -- Ruta de la foto del documento
ADD COLUMN license_photo_path VARCHAR(500); -- Ruta de la foto de la licencia

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_delivery_applications_vehicle_type ON delivery_applications(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_delivery_applications_work_zones ON delivery_applications USING GIN(work_zones);

-- Comentarios para documentar los campos
COMMENT ON COLUMN delivery_applications.full_name IS 'Nombre completo del solicitante';
COMMENT ON COLUMN delivery_applications.phone IS 'Número de teléfono de contacto';
COMMENT ON COLUMN delivery_applications.address IS 'Dirección completa de residencia';
COMMENT ON COLUMN delivery_applications.birth_date IS 'Fecha de nacimiento';
COMMENT ON COLUMN delivery_applications.document_id IS 'Número de documento de identidad';
COMMENT ON COLUMN delivery_applications.vehicle_type IS 'Tipo de vehículo: bicicleta, moto, carro, a_pie';
COMMENT ON COLUMN delivery_applications.has_license IS 'Indica si tiene licencia de conducción';
COMMENT ON COLUMN delivery_applications.license_number IS 'Número de licencia de conducción';
COMMENT ON COLUMN delivery_applications.work_zones IS 'Array de zonas donde puede trabajar';
COMMENT ON COLUMN delivery_applications.availability_schedule IS 'Horarios disponibles en formato JSON';
COMMENT ON COLUMN delivery_applications.previous_experience IS 'Experiencia previa en delivery o trabajos similares';
COMMENT ON COLUMN delivery_applications.why_delivery IS 'Razones para querer trabajar como domiciliario';
COMMENT ON COLUMN delivery_applications.customer_service_experience IS 'Experiencia en atención al cliente';
COMMENT ON COLUMN delivery_applications.cv_file_path IS 'Ruta del archivo de hoja de vida';
COMMENT ON COLUMN delivery_applications.id_document_path IS 'Ruta de la foto del documento de identidad';
COMMENT ON COLUMN delivery_applications.license_photo_path IS 'Ruta de la foto de la licencia de conducción';