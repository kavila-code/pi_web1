# DomiTulua - Plataforma de Delivery

Proyecto grupal de desarrollo web para la asignatura Ambiente Web I y Bases de Datos, UCEVA.

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js (v16+)
- PostgreSQL (v12+)
- npm o yarn

### Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/kavila-code/pi_web1.git
cd pi_web1
```

2. Instala dependencias:

```bash
npm install
```

3. Configura variables de entorno:
   Crea un archivo `.env` en la raíz con:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db
JWT_SECRET=tu_clave_secreta_aqui
PORT=3000
```

4. Ejecuta las migraciones de base de datos:

```bash
npm run db:migrate:orders
node ./database/migrate-user-roles.js
```

5. Inicia el servidor:

```bash
npm start
# o para desarrollo con auto-reload:
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
pi_web/
├── controllers/       # Lógica de negocio
├── database/          # Migraciones y conexión DB
├── middlewares/       # Autenticación, validación, etc.
├── models/            # Modelos de datos
├── routes/            # Definición de endpoints
├── public/            # HTML estáticos (sin JS inline)
├── frontend/          # Activos del frontend (CSS/JS)
│   ├── foodie.css
│   ├── admin-dashboard.css
│   └── js/
│       ├── common.js
│       ├── index.js
│       ├── login.js
│       ├── register-restaurant.js
│       ├── checkout.js
│       ├── restaurant-menu.js
│       ├── cart.js
│       ├── restaurants.js
│       ├── my-orders.js
│       ├── order-success.js
│       ├── admin-dashboard.js
│       ├── user-dashboard.js
│       ├── delivery-dashboard.js
│       └── delivery-orders.js
├── uploads/           # Archivos subidos
└── index.js           # Entry point
```

## 🗄️ Base de Datos

Ver documentación detallada en [`database/README.md`](./database/README.md)

### Tablas Principales

- `users` - Usuarios registrados
- `user_roles` - Roles (user, delivery, admin)
- `user_details` - Información extendida de usuarios
- `restaurants` - Restaurantes disponibles
- `products` - Menú de productos
- `orders` - Pedidos realizados
- `delivery_applications` - Solicitudes de repartidores

## 🔌 API Endpoints

### Autenticación

- `POST /api/v1/users/register` - Registrar usuario
- `POST /api/v1/users/login` - Iniciar sesión
- `GET /api/v1/users/profile` - Perfil del usuario (requiere auth)

### Información de Usuario

- `GET /api/v1/user-info/me` - Ver mi información
- `POST /api/v1/user-info/me` - Crear/actualizar mi información
- `PATCH /api/v1/user-info/me` - Actualizar campos específicos
- `DELETE /api/v1/user-info/me` - Eliminar mi información
- `GET /api/v1/user-info/me/complete` - Verificar si perfil está completo

### Administración (Admin)

- `GET /api/v1/user-info/:uid` - Ver información de usuario
- `GET /api/v1/user-info/by-municipio/:municipio` - Listar por municipio
- `GET /api/v1/user-info/by-departamento/:departamento` - Listar por departamento

### Restaurantes y Productos

- `GET /api/v1/restaurants` - Listar restaurantes
- `GET /api/v1/products/:restaurantId` - Productos de un restaurante

### Pedidos

- `POST /api/v1/orders` - Crear pedido
- `GET /api/v1/orders` - Mis pedidos
- `GET /api/v1/orders/:id` - Detalle de pedido

## 🛠️ Scripts Disponibles

```bash
npm start          # Iniciar servidor
npm run dev        # Modo desarrollo (nodemon)
npm run db:migrate:orders  # Migrar schema de pedidos
```

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación. Los roles disponibles son:

- **user** - Usuario cliente
- **delivery** - Repartidor
- **admin** - Administrador

Los tokens deben enviarse en el header `Authorization: Bearer <token>`

## 📝 Notas Técnicas

- El backend usa ES6 modules (`type: "module"` en package.json)
- La tabla `user_details` almacena información extendida (NO `user_info`)
- La ruta API `/api/v1/user-info` es un alias que internamente usa `user_details`
- Validaciones implementadas con `express-validator`
- Autenticación via middleware `authMiddleware` y `adminMiddleware`

### Frontend (refactor)

- Todo el JavaScript del cliente fue externalizado a `/frontend/js`.
- Los HTML en `public/` referencian `bootstrap.bundle.min.js` → `/frontend/js/common.js` → el JS específico de la página.
- Beneficios: código más modular, mantenible y sin scripts inline.

## ✅ Verificación rápida

Tras iniciar el servidor, estas rutas deben responder 200 (según rol/autenticación):

- `/`
- `/public/restaurants.html`
- `/public/admin-dashboard.html` (requiere token admin)
- `/public/user-dashboard.html` (requiere token user)
- `/public/delivery-dashboard.html` y `/public/delivery-orders.html` (requiere token delivery)

Y los JS estáticos deben servirse en `/frontend/js/*` (por ejemplo, `common.js`, `restaurants.js`).

## 👥 Equipo

Proyecto desarrollado por estudiantes de UCEVA - Ambiente Web I y Bases de Datos

## 📄 Licencia

ISC
