-- Copiar datos relevantes desde delivery_applications a users para solicitudes aprobadas
-- Ejecutar esto después de haber aplicado `add_delivery_fields_to_users.sql`

-- Copiar campos básicos (solo si están vacíos en users)
UPDATE users u
SET
  full_name = COALESCE(da.full_name, u.full_name),
  phone = COALESCE(da.phone, u.phone),
  address = COALESCE(da.address, u.address),
  birth_date = COALESCE(da.birth_date, u.birth_date),
  document_id = COALESCE(da.document_id, u.document_id),
  vehicle_type = COALESCE(da.vehicle_type, u.vehicle_type),
  has_license = COALESCE(da.has_license, u.has_license),
  license_number = COALESCE(da.license_number, u.license_number),
  work_zones = COALESCE(da.work_zones, u.work_zones),
  availability_schedule = COALESCE(da.availability_schedule, u.availability_schedule),
  previous_experience = COALESCE(da.previous_experience, u.previous_experience),
  why_delivery = COALESCE(da.why_delivery, u.why_delivery),
  customer_service_experience = COALESCE(da.customer_service_experience, u.customer_service_experience),
  cv_file_path = COALESCE(da.cv_file_path, u.cv_file_path),
  id_document_path = COALESCE(da.id_document_path, u.id_document_path),
  license_photo_path = COALESCE(da.license_photo_path, u.license_photo_path),
  updated_at = CURRENT_TIMESTAMP
FROM delivery_applications da
WHERE u.uid = da.user_id
  AND da.status = 'aprobada'
  AND (
    u.full_name IS NULL OR u.phone IS NULL OR u.address IS NULL OR u.document_id IS NULL
  );

-- Asignar rol 'delivery' en user_roles para usuarios con solicitudes aprobadas
INSERT INTO user_roles (user_id, role, is_active, assigned_at)
SELECT user_id, 'delivery', true, CURRENT_TIMESTAMP
FROM delivery_applications
WHERE status = 'aprobada'
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true, assigned_at = EXCLUDED.assigned_at;

-- Nota: este script intenta no sobrescribir datos existentes en `users`.