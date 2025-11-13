-- ============================================
-- ESQUEMA DE BASE DE DATOS - SISTEMA DE PEDIDOS
-- DomiTulua - Gestión de Pedidos y Restaurantes
-- ============================================

-- Tabla: restaurants (Restaurantes)
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    category VARCHAR(100), -- Italiana, Mexicana, China, Comida Rápida, etc.
    rating DECIMAL(2, 1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    delivery_time_min INTEGER DEFAULT 30, -- Tiempo estimado en minutos
    delivery_time_max INTEGER DEFAULT 45,
    delivery_cost DECIMAL(10, 2) DEFAULT 0.00,
    minimum_order DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    is_open BOOLEAN DEFAULT true,
    opening_hours JSONB, -- { "lunes": "9:00-22:00", "martes": "9:00-22:00", ... }
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: products (Productos/Menú)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500),
    category VARCHAR(100), -- Entradas, Platos Fuertes, Bebidas, Postres, etc.
    is_available BOOLEAN DEFAULT true,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    preparation_time INTEGER DEFAULT 15, -- Tiempo de preparación en minutos
    calories INTEGER,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    allergens TEXT[], -- Array de alérgenos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: orders (Pedidos)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL, -- Ej: ORD-20250118-001
    customer_id INTEGER NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    delivery_person_id INTEGER REFERENCES users(uid) ON DELETE SET NULL,
    
    -- Información de entrega
    delivery_address TEXT NOT NULL,
    delivery_phone VARCHAR(20) NOT NULL,
    delivery_notes TEXT,
    
    -- Montos
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00 CHECK (delivery_fee >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    
    -- Estado del pedido
    status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN (
        'pendiente',        -- Pedido recibido, esperando confirmación
        'confirmado',       -- Restaurante confirmó el pedido
        'preparando',       -- Restaurante está preparando la comida
        'listo',           -- Pedido listo para recoger
        'en_camino',       -- Domiciliario en camino con el pedido
        'entregado',       -- Pedido entregado exitosamente
        'cancelado'        -- Pedido cancelado
    )),
    
    -- Método de pago
    payment_method VARCHAR(50) DEFAULT 'efectivo' CHECK (payment_method IN (
        'efectivo',
        'tarjeta',
        'transferencia',
        'pse'
    )),
    payment_status VARCHAR(50) DEFAULT 'pendiente' CHECK (payment_status IN (
        'pendiente',
        'pagado',
        'rechazado',
        'reembolsado'
    )),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    preparing_at TIMESTAMP,
    ready_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Razón de cancelación
    cancellation_reason TEXT,
    
    -- Rating y comentarios
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    reviewed_at TIMESTAMP,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: order_items (Ítems del pedido)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    
    -- Información del producto en el momento del pedido
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
    
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    -- Personalizaciones
    special_instructions TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: order_status_history (Historial de estados del pedido)
CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(uid),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para restaurants
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_restaurant ON products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_person ON orders(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Índices para order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Índices para order_status_history
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_created ON order_status_history(created_at DESC);

-- ============================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Trigger para actualizar updated_at en restaurants
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS DE EJEMPLO PARA TESTING
-- ============================================

-- Insertar restaurantes de ejemplo
INSERT INTO restaurants (name, description, address, phone, category, rating, delivery_time_min, delivery_time_max, delivery_cost, minimum_order, logo_url, opening_hours) VALUES
('Pizza Palace', 'Las mejores pizzas artesanales de la ciudad', 'Calle 5 #10-20, Centro', '3001234567', 'Italiana', 4.8, 30, 45, 5000, 15000, '/IMAGENES/RESTAURANTES/LA%20BELLA%20ITALIA.jpg', '{"lunes": "11:00-23:00", "martes": "11:00-23:00", "miércoles": "11:00-23:00", "jueves": "11:00-23:00", "viernes": "11:00-01:00", "sábado": "11:00-01:00", "domingo": "12:00-22:00"}'),
('Burger House', 'Hamburguesas gourmet y comida rápida', 'Avenida 6N #15-30', '3107654321', 'Comida Rápida', 4.6, 20, 35, 3000, 10000, '/IMAGENES/RESTAURANTES/burger-master.jpg', '{"lunes": "10:00-22:00", "martes": "10:00-22:00", "miércoles": "10:00-22:00", "jueves": "10:00-22:00", "viernes": "10:00-23:00", "sábado": "10:00-23:00", "domingo": "11:00-21:00"}'),
('Sushi Zen', 'Auténtica comida japonesa', 'Carrera 8 #25-40', '3209876543', 'Japonesa', 4.9, 40, 55, 7000, 20000, '/IMAGENES/RESTAURANTES/SAKURA%20SUSHI.jpg', '{"lunes": "12:00-22:00", "martes": "12:00-22:00", "miércoles": "12:00-22:00", "jueves": "12:00-22:00", "viernes": "12:00-23:00", "sábado": "12:00-23:00", "domingo": "13:00-21:00"}'),
('Tacos El Charro', 'Sabor mexicano auténtico', 'Calle 10 #8-15', '3156789012', 'Mexicana', 4.7, 25, 40, 4000, 12000, '/IMAGENES/RESTAURANTES/Tacos%20el%20charro.jpg', '{"lunes": "11:00-21:00", "martes": "11:00-21:00", "miércoles": "11:00-21:00", "jueves": "11:00-21:00", "viernes": "11:00-23:00", "sábado": "11:00-23:00", "domingo": "12:00-20:00"}'),
('La Parrilla', 'Carnes y asados a la parrilla', 'Avenida 4 #12-25', '3045678901', 'Parrilla', 4.5, 35, 50, 5000, 18000, '/IMAGENES/RESTAURANTES/La%20parrilla.jpg', '{"lunes": "12:00-22:00", "martes": "12:00-22:00", "miércoles": "12:00-22:00", "jueves": "12:00-22:00", "viernes": "12:00-00:00", "sábado": "12:00-00:00", "domingo": "12:00-21:00"}')
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo para Pizza Palace (id=1)
INSERT INTO products (restaurant_id, name, description, price, category, preparation_time, calories, is_vegetarian) VALUES
(1, 'Pizza Margherita', 'Tomate, mozzarella y albahaca fresca', 25000, 'Pizzas', 15, 800, true),
(1, 'Pizza Pepperoni', 'Mozzarella y pepperoni premium', 28000, 'Pizzas', 15, 950, false),
(1, 'Pizza Hawaiana', 'Jamón, piña y queso mozzarella', 27000, 'Pizzas', 15, 850, false),
(1, 'Pizza Vegetariana', 'Champiñones, pimentón, cebolla, aceitunas', 26000, 'Pizzas', 15, 700, true),
(1, 'Lasaña Bolognesa', 'Pasta al horno con carne y bechamel', 22000, 'Pastas', 20, 650, false),
(1, 'Gaseosa 1.5L', 'Coca-Cola, Sprite o Colombiana', 5000, 'Bebidas', 0, 200, true),
(1, 'Tiramisu', 'Postre italiano tradicional', 8000, 'Postres', 5, 350, true)
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo para Burger House (id=2)
INSERT INTO products (restaurant_id, name, description, price, category, preparation_time, calories, is_vegetarian) VALUES
(2, 'Burger Clásica', 'Carne de res, lechuga, tomate, queso', 18000, 'Hamburguesas', 10, 700, false),
(2, 'Burger BBQ Bacon', 'Carne, tocineta, queso, salsa BBQ', 22000, 'Hamburguesas', 12, 850, false),
(2, 'Burger Vegetariana', 'Hamburguesa de quinoa y vegetales', 19000, 'Hamburguesas', 10, 550, true),
(2, 'Papas Fritas Grandes', 'Papas crujientes con sal', 8000, 'Acompañamientos', 5, 400, true),
(2, 'Aros de Cebolla', 'Aros de cebolla empanizados', 9000, 'Acompañamientos', 7, 350, true),
(2, 'Malteada de Chocolate', 'Cremosa malteada de chocolate', 7000, 'Bebidas', 3, 450, true),
(2, 'Nuggets de Pollo (10 und)', 'Nuggets de pollo crujientes', 15000, 'Pollo', 8, 600, false)
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo para Sushi Zen (id=3)
INSERT INTO products (restaurant_id, name, description, price, category, preparation_time, calories) VALUES
(3, 'Sushi Variado (12 piezas)', 'Selección de nigiri y maki', 35000, 'Sushi', 20, 400),
(3, 'Sashimi de Salmón', '8 cortes de salmón fresco', 32000, 'Sashimi', 15, 300),
(3, 'Rollo California', 'Surimi, aguacate, pepino', 28000, 'Rollos', 15, 350),
(3, 'Rollo Philadelphia', 'Salmón, queso crema, aguacate', 30000, 'Rollos', 15, 400),
(3, 'Tempura de Camarón', 'Camarones empanizados con salsa', 25000, 'Entradas', 12, 500),
(3, 'Edamame', 'Frijoles de soja al vapor', 8000, 'Entradas', 5, 150),
(3, 'Té Verde', 'Té japonés tradicional', 4000, 'Bebidas', 3, 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE restaurants IS 'Catálogo de restaurantes registrados en la plataforma';
COMMENT ON TABLE products IS 'Productos/menú de cada restaurante';
COMMENT ON TABLE orders IS 'Pedidos realizados por los clientes';
COMMENT ON TABLE order_items IS 'Detalle de productos en cada pedido';
COMMENT ON TABLE order_status_history IS 'Historial de cambios de estado de los pedidos';

COMMENT ON COLUMN orders.order_number IS 'Número único de pedido para tracking';
COMMENT ON COLUMN orders.status IS 'Estado actual del pedido en el flujo de entrega';
COMMENT ON COLUMN products.discount_percentage IS 'Porcentaje de descuento aplicable al producto';
COMMENT ON COLUMN restaurants.opening_hours IS 'Horarios de apertura en formato JSON por día de la semana';
