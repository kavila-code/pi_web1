-- Crear tabla para solicitudes de domiciliarios
CREATE TABLE delivery_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
    observaciones TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP,
    admin_id INTEGER REFERENCES users(uid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_delivery_applications_user_id ON delivery_applications(user_id);
CREATE INDEX idx_delivery_applications_status ON delivery_applications(status);
CREATE INDEX idx_delivery_applications_fecha_solicitud ON delivery_applications(fecha_solicitud);

-- Comentarios para documentación
COMMENT ON TABLE delivery_applications IS 'Solicitudes de usuarios para trabajar como domiciliarios';
COMMENT ON COLUMN delivery_applications.status IS 'Estado de la solicitud: pendiente, aprobada, rechazada';
COMMENT ON COLUMN delivery_applications.observaciones IS 'Comentarios del administrador sobre la solicitud';
COMMENT ON COLUMN delivery_applications.fecha_revision IS 'Fecha cuando el admin revisó la solicitud';