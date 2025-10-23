# Base de Datos - DomiTulua

Esta carpeta contiene las migraciones y scripts para gestionar el esquema de la base de datos PostgreSQL.

## 📋 Estructura de Tablas

### Autenticación y Usuarios

- **users** - Datos básicos de autenticación (email, password, username)
- **user_roles** - Sistema de roles múltiples (user, delivery, admin)
- **user_details** - Información extendida (cédula, nombre, apellidos, dirección, etc.)

### Pedidos y Restaurantes

- **restaurants** - Catálogo de restaurantes
- **products** - Productos/menú de restaurantes
- **orders** - Pedidos realizados
- **order_items** - Items de cada pedido
- **order_status_history** - Historial de cambios de estado

### Aplicaciones de Repartidores

- **delivery_applications** - Solicitudes para ser repartidor

## 🚀 Migraciones Disponibles

### Crear Schema de Pedidos

```powershell
npm run db:migrate:orders
```

Crea las tablas: restaurants, products, orders, order_items, order_status_history

### Crear Sistema de Roles

```powershell
node ./database/migrate-user-roles.js
```

Crea la tabla user_roles y asigna rol 'user' por defecto a usuarios existentes

### Corregir/Actualizar Roles

```powershell
node ./database/fix-user-roles.js
```

Añade columnas faltantes (assigned_at, is_active) e índices a user_roles

## 📝 Archivos

### Scripts de Migración

- `run-migrations.js` - Ejecuta create_orders_schema.sql
- `migrate-user-roles.js` - Ejecuta create_user_roles_table.sql
- `fix-user-roles.js` - Ejecuta fix_user_roles_table.sql

### Archivos SQL

- `create_orders_schema.sql` - Schema completo de pedidos
- `create_user_roles_table.sql` - Tabla de roles
- `fix_user_roles_table.sql` - Correcciones a user_roles
- `delivery_applications.sql` - Tabla de aplicaciones delivery
- `update_delivery_applications.sql` - Actualizaciones a delivery_applications
- `add_fields_to_users.sql` - Alteraciones a tabla users
- `add_updated_at_to_users.sql` - Añade timestamp updated_at

### Configuración

- `connection.database.js` - Pool de conexión a PostgreSQL

## ⚙️ Variables de Entorno

Asegúrate de tener en tu `.env`:

```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db
```

## 📌 Notas Importantes

- **user_details** es la tabla real para información extendida de usuarios (NO user_info)
- **user_roles** permite que un usuario tenga múltiples roles simultáneamente
- Los endpoints de la API usan `/api/v1/user-info` pero internamente guardan en `user_details`
- Siempre hacer backup antes de ejecutar migraciones en producción
