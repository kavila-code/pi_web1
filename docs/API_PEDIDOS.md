# 📚 DOCUMENTACIÓN DE APIs - Sistema de Pedidos

## 🏪 **RESTAURANTES** (`/api/v1/restaurants`)

### Públicas (sin autenticación)

#### 1. **Listar Restaurantes**

```
GET /api/v1/restaurants
```

**Query params:**

- `category`: Filtrar por categoría
- `search`: Buscar por nombre/descripción
- `is_active`: true/false
- `order_by`: name/rating/delivery_fee
- `order_dir`: ASC/DESC
- `limit`: Cantidad de resultados
- `offset`: Paginación

**Respuesta:**

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "La Gran Manzana",
      "category": "Comida Rápida",
      "rating": 4.5,
      "delivery_time": "30-45 min",
      "delivery_fee": 3000,
      "products_count": "12"
    }
  ],
  "count": 5
}
```

#### 2. **Ver Restaurante**

```
GET /api/v1/restaurants/:id
```

**Respuesta incluye:** Restaurante + productos + estadísticas

#### 3. **Categorías de Restaurantes**

```
GET /api/v1/restaurants/categories
```

### Protegidas (Admin)

#### 4. **Crear Restaurante**

```
POST /api/v1/restaurants
Headers: Authorization: Bearer {token}
```

**Body:**

```json
{
  "name": "Restaurante Ejemplo",
  "description": "Descripción",
  "category": "Comida Rápida",
  "address": "Calle 123",
  "phone": "3001234567",
  "email": "ejemplo@mail.com",
  "logo_url": "https://...",
  "delivery_time": "30-45 min",
  "minimum_order": 15000,
  "delivery_fee": 3000
}
```

#### 5. **Actualizar Restaurante**

```
PUT /api/v1/restaurants/:id
Headers: Authorization: Bearer {token}
```

#### 6. **Eliminar Restaurante**

```
DELETE /api/v1/restaurants/:id
Headers: Authorization: Bearer {token}
```

---

## 🍕 **PRODUCTOS** (`/api/v1/products`)

### Públicas

#### 7. **Productos de un Restaurante**

```
GET /api/v1/restaurants/:restaurantId/products
```

**Query params:**

- `category`: Filtrar por categoría
- `is_vegetarian`: true/false
- `is_vegan`: true/false
- `search`: Buscar por nombre
- `is_available`: true/false (default: true)

**Respuesta:**

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "name": "Hamburguesa Clásica",
      "description": "Con carne 100% res",
      "price": 18000,
      "category": "Hamburguesas",
      "is_vegetarian": false,
      "is_available": true,
      "image_url": "https://..."
    }
  ],
  "count": 12
}
```

#### 8. **Ver Producto**

```
GET /api/v1/products/:id
```

**Respuesta incluye:** Producto + datos del restaurante

#### 9. **Productos por IDs (Carrito)**

```
POST /api/v1/products/batch
```

**Body:**

```json
{
  "ids": [1, 3, 5, 8]
}
```

**Uso:** Para validar carrito y obtener precios actuales

#### 10. **Categorías de Productos**

```
GET /api/v1/restaurants/:restaurantId/products/categories
```

### Protegidas (Admin)

#### 11. **Crear Producto**

```
POST /api/v1/products
Headers: Authorization: Bearer {token}
```

**Body:**

```json
{
  "restaurant_id": 1,
  "name": "Producto Nuevo",
  "description": "Descripción",
  "category": "Categoría",
  "price": 15000,
  "image_url": "https://...",
  "is_vegetarian": false,
  "is_vegan": false,
  "is_available": true
}
```

#### 12. **Actualizar Producto**

```
PUT /api/v1/products/:id
Headers: Authorization: Bearer {token}
```

#### 13. **Eliminar Producto**

```
DELETE /api/v1/products/:id
Headers: Authorization: Bearer {token}
```

---

## 📦 **PEDIDOS** (`/api/v1/orders`)

### Para Clientes

#### 14. **Crear Pedido**

```
POST /api/v1/orders
Headers: Authorization: Bearer {token}
```

**Body:**

```json
{
  "restaurant_id": 1,
  "delivery_address": "Calle 123 #45-67",
  "delivery_phone": "3001234567",
  "delivery_notes": "Timbre en el segundo piso",
  "payment_method": "efectivo",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "special_instructions": "Sin cebolla"
    },
    {
      "product_id": 5,
      "quantity": 1
    }
  ]
}
```

**Respuesta:**

```json
{
  "ok": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "id": 1,
    "order_number": "ORD-20251018-1234",
    "status": "pendiente",
    "subtotal": 36000,
    "delivery_fee": 3000,
    "tax_amount": 6840,
    "total": 45840
  }
}
```

#### 15. **Mis Pedidos**

```
GET /api/v1/orders/my-orders
Headers: Authorization: Bearer {token}
```

**Query params:**

- `status`: pendiente/confirmado/preparando/listo/en_camino/entregado/cancelado
- `limit`: Cantidad
- `offset`: Paginación

#### 16. **Ver Detalle de Pedido**

```
GET /api/v1/orders/:id
Headers: Authorization: Bearer {token}
```

**Respuesta incluye:**

- Datos del pedido
- Items con productos
- Historial de estados
- Datos del restaurante
- Datos del domiciliario (si aplica)

#### 17. **Cancelar Pedido**

```
POST /api/v1/orders/:id/cancel
Headers: Authorization: Bearer {token}
```

**Body:**

```json
{
  "reason": "Ya no lo necesito"
}
```

#### 18. **Calificar Pedido**

```
POST /api/v1/orders/:id/review
Headers: Authorization: Bearer {token}
```

**Body:**

```json
{
  "rating": 5,
  "review": "Excelente servicio y comida deliciosa"
}
```

---

### Para Domiciliarios

#### 19. **Pedidos Disponibles**

```
GET /api/v1/orders/available
Headers: Authorization: Bearer {token}
```

Muestra pedidos con `status = 'listo'` y sin domiciliario asignado.

#### 20. **Mis Entregas**

```
GET /api/v1/orders/my-deliveries
Headers: Authorization: Bearer {token}
```

**Query params:**

- `status`: listo/en_camino/entregado

#### 21. **Aceptar Pedido**

```
POST /api/v1/orders/:id/assign
Headers: Authorization: Bearer {token}
```

Asigna el pedido al domiciliario y cambia estado a `en_camino`.

#### 22. **Actualizar Estado**

```
PUT /api/v1/orders/:id/status
Headers: Authorization: Bearer {token}
```

**Body:**

```json
{
  "status": "entregado",
  "notes": "Entregado exitosamente"
}
```

---

### Para Admin

#### 23. **Todos los Pedidos**

```
GET /api/v1/admin/orders
Headers: Authorization: Bearer {token}
```

**Query params:**

- `status`: Estado
- `restaurant_id`: Filtrar por restaurante
- `delivery_person_id`: Filtrar por domiciliario
- `date_from`: Fecha desde (YYYY-MM-DD)
- `date_to`: Fecha hasta
- `limit`: Cantidad
- `offset`: Paginación

#### 24. **Pedidos de un Restaurante**

```
GET /api/v1/admin/restaurants/:restaurantId/orders
Headers: Authorization: Bearer {token}
```

#### 25. **Estadísticas de Pedidos**

```
GET /api/v1/admin/orders/stats
Headers: Authorization: Bearer {token}
```

**Respuesta:**

```json
{
  "ok": true,
  "data": {
    "total_orders": 150,
    "pending_orders": 5,
    "confirmed_orders": 8,
    "preparing_orders": 12,
    "ready_orders": 3,
    "in_delivery_orders": 7,
    "delivered_orders": 110,
    "cancelled_orders": 5,
    "total_revenue": 4500000,
    "average_order_value": 30000
  }
}
```

---

## 🔐 **AUTENTICACIÓN**

### Headers Requeridos

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles

- **Cliente:** Puede crear pedidos, ver sus pedidos, cancelar, calificar
- **Domiciliario:** Puede ver disponibles, aceptar, actualizar estado
- **Admin:** Acceso completo a todos los endpoints

---

## 📊 **ESTADOS DE PEDIDOS**

```
pendiente → confirmado → preparando → listo → en_camino → entregado
                                                    ↓
                                               cancelado
```

### Flujo:

1. **pendiente**: Cliente crea pedido
2. **confirmado**: Restaurante acepta
3. **preparando**: Restaurante está preparando
4. **listo**: Pedido listo para recoger
5. **en_camino**: Domiciliario recogió y va en camino
6. **entregado**: Cliente recibió el pedido
7. **cancelado**: Pedido cancelado (en cualquier momento)

---

## 🧪 **EJEMPLOS DE USO**

### Flujo Cliente

```javascript
// 1. Ver restaurantes
GET /api/v1/restaurants

// 2. Ver menú de restaurante
GET /api/v1/restaurants/1/products

// 3. Crear pedido
POST /api/v1/orders
Body: { restaurant_id, items, delivery_address, ... }

// 4. Ver mis pedidos
GET /api/v1/orders/my-orders

// 5. Ver detalle
GET /api/v1/orders/1

// 6. Calificar (cuando esté entregado)
POST /api/v1/orders/1/review
```

### Flujo Domiciliario

```javascript
// 1. Ver pedidos disponibles
GET / api / v1 / orders / available;

// 2. Aceptar pedido
POST / api / v1 / orders / 1 / assign;

// 3. Ver mis entregas
GET / api / v1 / orders / my - deliveries;

// 4. Actualizar a entregado
PUT / api / v1 / orders / 1 / status;
Body: {
  status: "entregado";
}
```

---

## ✅ **VALIDACIONES IMPLEMENTADAS**

### Crear Pedido

- ✅ Productos existen
- ✅ Productos del mismo restaurante
- ✅ Productos disponibles
- ✅ Precios correctos (se validan en backend)
- ✅ Cálculo automático de totales

### Actualizar Estado

- ✅ Estados válidos
- ✅ Permisos según rol
- ✅ Registro en historial

### Asignar Domiciliario

- ✅ Pedido en estado "listo"
- ✅ Sin domiciliario previo
- ✅ Cambio automático a "en_camino"

---

**🎉 25 APIs REST completamente funcionales para el sistema de pedidos!**

---

## 🚴‍♂️ DELIVERY APPLICATIONS (`/api/v1/delivery-applications`)

Endpoints para gestionar las solicitudes de usuarios que quieren ser domiciliarios. Estos endpoints son usados por el dashboard de Admin y los paneles de Usuario/Domiciliario en el frontend.

### Cliente (Usuario autenticado)

#### 1. Crear solicitud

```
POST /api/v1/delivery-applications/apply
Headers: Authorization: Bearer {token}
```

Body (multipart/form-data si adjunta documentos; JSON básico mínimo):

```json
{
  "full_name": "Juan Pérez",
  "phone": "3001234567",
  "vehicle_type": "moto",
  "work_zones": ["Centro", "Norte"]
}
```

Respuesta:

```json
{
  "ok": true,
  "message": "Solicitud creada",
  "data": { "id": 12, "status": "pending" }
}
```

#### 2. Ver mi solicitud

```
GET /api/v1/delivery-applications/my-application
Headers: Authorization: Bearer {token}
```

---

### Admin (Protegidas)

#### 3. Listar todas

```
GET /api/v1/delivery-applications/all
Headers: Authorization: Bearer {token}
```

Query params:

- `status`: pending/under_review/approved/rejected
- `limit`, `offset`

#### 4. Ver estadísticas

```
GET /api/v1/delivery-applications/stats
Headers: Authorization: Bearer {token}
```

Respuesta:

```json
{
  "ok": true,
  "data": {
    "total": 25,
    "pending": 5,
    "under_review": 3,
    "approved": 12,
    "rejected": 5
  }
}
```

#### 5. Ver solicitud por id

```
GET /api/v1/delivery-applications/:id
Headers: Authorization: Bearer {token}
```

#### 6. Actualizar estado

```
PUT /api/v1/delivery-applications/:id/status
Headers: Authorization: Bearer {token}
```

Body:

```json
{ "status": "approved", "notes": "Documentos válidos" }
```

#### 7. Eliminar solicitud

```
DELETE /api/v1/delivery-applications/:id
Headers: Authorization: Bearer {token}
```

Notas:

- Los documentos subidos (cédula, licencia, SOAT, etc.) quedan almacenados y pueden previsualizarse desde el dashboard.
- Al aprobarse, el usuario recibe el rol de domiciliario y puede empezar a tomar pedidos.
