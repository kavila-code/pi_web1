# Resumen de Cambios - Sistema de Roles Múltiples

## ✅ Archivos Modificados

### Modelos

- **`models/user.model.js`**
  - ✅ Método `create()` actualizado para usar transacciones
  - ✅ Métodos de búsqueda ahora retornan array `roles`
  - ✅ Agregados métodos: `addRole()`, `removeRole()`, `hasRole()`

### Controladores

- **`controllers/user.controller.js`**

  - ✅ `register()`: Retorna `roles` array
  - ✅ `login()`: Retorna `roles` array y genera JWT con roles
  - ✅ `profile()`: Retorna `roles` array

- **`controllers/order.controller.js`**

  - ✅ `getOrderById()`: Verifica roles como array

- **`controllers/delivery-application.controller.js`**
  - ✅ `createApplication()`: Verifica roles como array
  - ✅ Comentada restricción de admins (ahora pueden aplicar)

### Middlewares

- **`middlewares/auth.middleware.js`**

  - ✅ Decodifica y pasa `roles` como array en `req.roles`

- **`middlewares/admin.middleware.js`**

  - ✅ Verifica si `admin` está en array de roles

- **`middlewares/role.middleware.js`** ⭐ NUEVO
  - ✅ `requireRole()`: Verifica si tiene AL MENOS un rol
  - ✅ `requireAllRoles()`: Verifica si tiene TODOS los roles
  - ✅ Helpers: `requireAdmin`, `requireDelivery`, `requireUser`, `requireDeliveryOrAdmin`

### Base de Datos

- **`database/create_user_roles_table.sql`** ⭐ NUEVO

  - ✅ Crea tabla `user_roles`
  - ✅ Índices para rendimiento
  - ✅ Migra datos existentes o asigna rol 'user' por defecto

- **`database/migrate-user-roles.js`** ⭐ NUEVO
  - ✅ Script para ejecutar la migración
  - ✅ Muestra estadísticas después de migrar

### Documentación

- **`MIGRATION_GUIDE_ROLES.md`** ⭐ NUEVO
  - ✅ Guía completa de migración
  - ✅ Ejemplos de uso
  - ✅ Tests de verificación

---

## 🔑 Cambios Clave

### Antes (Sistema Antiguo)

```javascript
// JWT
{ uid: 1, email: "user@example.com", role: "user" }

// Verificación
if (req.role === 'admin') { ... }

// Base de datos
users table: uid, email, password, role
```

### Después (Sistema Nuevo)

```javascript
// JWT
{ uid: 1, email: "user@example.com", roles: ["user", "delivery"] }

// Verificación
if (req.roles.includes('admin')) { ... }

// Base de datos
users table: uid, email, password
user_roles table: id, user_id, role, is_active
```

---

## 🚀 Cómo Ejecutar la Migración

### 1. Ejecutar script SQL

```bash
node database/migrate-user-roles.js
```

### 2. Verificar cambios

```bash
# Conectarse a PostgreSQL
psql -U tu_usuario -d tu_database

# Ver usuarios y sus roles
SELECT u.uid, u.email, ARRAY_AGG(ur.role) as roles
FROM users u
LEFT JOIN user_roles ur ON u.uid = ur.user_id
GROUP BY u.uid, u.email;
```

### 3. Reiniciar servidor

```bash
npm start
```

---

## 📋 Casos de Uso

### Caso 1: Cliente quiere ser repartidor

1. Usuario se registra como 'user'
2. Aplica para ser repartidor (delivery-application)
3. Admin aprueba la solicitud
4. Se ejecuta: `UserModel.addRole(userId, 'delivery')`
5. Usuario ahora tiene roles: `['user', 'delivery']`
6. Puede alternar entre dashboards

### Caso 2: Usuario con múltiples roles hace login

```javascript
// Login response
{
  "ok": true,
  "token": "...",
  "user": {
    "uid": 5,
    "email": "multi@example.com",
    "roles": ["user", "delivery"]
  }
}

// Frontend muestra selector de rol
// Usuario elige qué dashboard ver
```

### Caso 3: Verificación de permisos

```javascript
// Opción 1: Middleware
router.post(
  "/admin-action",
  authMiddleware,
  requireAdmin, // Solo si tiene rol 'admin'
  adminAction
);

// Opción 2: En controlador
const someAction = (req, res) => {
  if (req.roles.includes("admin")) {
    // Acceso completo
  } else if (req.roles.includes("delivery")) {
    // Acceso limitado
  } else {
    // Solo lectura
  }
};
```

---

## ⚠️ Notas Importantes

1. **Tokens antiguos**: Los tokens con `role` (singular) seguirán funcionando hasta que expiren (1 hora)

2. **Frontend**: Deberás actualizar el código que use `user.role` para que use `user.roles[0]` o `user.roles.includes(...)`

3. **Sesiones activas**: Usuarios logueados necesitarán volver a hacer login

4. **Roles válidos**:

   - `user`: Cliente normal
   - `delivery`: Repartidor
   - `admin`: Administrador

5. **Múltiples roles**: Un usuario puede tener varios roles simultáneamente

---

## 🔍 Testing

### Test Manual

```bash
# 1. Registrar nuevo usuario
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# 2. Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Debe retornar: roles: ["user"]

# 3. Agregar rol delivery (desde psql)
INSERT INTO user_roles (user_id, role) VALUES (1, 'delivery');

# 4. Login nuevamente
# Debe retornar: roles: ["user", "delivery"]
```

---

## ✨ Beneficios

1. ✅ **Flexibilidad**: Un usuario puede ser cliente Y repartidor
2. ✅ **Escalabilidad**: Fácil agregar nuevos roles
3. ✅ **Seguridad**: Verificación granular de permisos
4. ✅ **Auditoría**: Registro de cuándo se asignó cada rol
5. ✅ **Activación/Desactivación**: Roles se pueden activar/desactivar sin eliminar

---

## 📞 Soporte

Si tienes problemas con la migración:

1. Verifica que el script SQL se ejecutó correctamente
2. Revisa los logs del servidor
3. Verifica que todos los usuarios tienen al menos un rol:
   ```sql
   SELECT uid, email FROM users
   WHERE uid NOT IN (SELECT user_id FROM user_roles WHERE is_active = true);
   ```
4. Consulta `MIGRATION_GUIDE_ROLES.md` para más detalles
