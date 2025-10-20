# Guía de Migración a Sistema de Roles Múltiples

## Cambios Realizados

### 1. Base de Datos

- ✅ Eliminada columna `role` de la tabla `users`
- ✅ Creada tabla `user_roles` para relación muchos-a-muchos
- ✅ Script SQL: `database/create_user_roles_table.sql`

### 2. Modelo de Usuario

- ✅ Actualizado `UserModel.create()` para usar transacciones
- ✅ Actualizado todos los métodos de búsqueda para incluir array de roles
- ✅ Agregados métodos: `addRole()`, `removeRole()`, `hasRole()`

### 3. Controladores

- ✅ `register`: Ahora devuelve array `roles` en lugar de `role`
- ✅ `login`: Ahora devuelve array `roles` en lugar de `role`
- ✅ `profile`: Actualizado para array de roles
- ✅ `order.controller`: Actualizado para verificar roles como array
- ✅ `delivery-application.controller`: Actualizado para verificar roles como array

### 4. Middlewares

- ✅ `authMiddleware`: Ahora decodifica y pasa `roles` como array
- ✅ `adminMiddleware`: Verifica si `admin` está en el array de roles
- ✅ **NUEVO** `role.middleware.js`: Middlewares flexibles para verificación de roles

### 5. JWT

- ✅ Token ahora incluye `roles` (array) en lugar de `role` (string)
- ✅ Formato: `{ uid, email, roles: ['user', 'delivery'] }`

## Ejecutar Migración

### Paso 1: Ejecutar script SQL

```bash
# Conéctate a tu base de datos PostgreSQL
psql -U tu_usuario -d tu_database -f database/create_user_roles_table.sql
```

O desde Node.js:

```javascript
import { db } from "./database/connection.database.js";
import fs from "fs";

const sql = fs.readFileSync("./database/create_user_roles_table.sql", "utf8");
await db.query(sql);
```

### Paso 2: Verificar la migración

```sql
-- Verificar que la tabla fue creada
SELECT * FROM user_roles;

-- Verificar que todos los usuarios tienen al menos el rol 'user'
SELECT u.uid, u.email, ARRAY_AGG(ur.role) as roles
FROM users u
LEFT JOIN user_roles ur ON u.uid = ur.user_id
GROUP BY u.uid, u.email;
```

## Uso de los Nuevos Middlewares

### Opción 1: Usar middlewares predefinidos

```javascript
import {
  requireAdmin,
  requireDelivery,
  requireDeliveryOrAdmin,
} from "../middlewares/role.middleware.js";

// Solo admins
router.get("/admin/stats", authMiddleware, requireAdmin, getStats);

// Solo repartidores
router.get(
  "/delivery/orders",
  authMiddleware,
  requireDelivery,
  getDeliveryOrders
);

// Admins O repartidores
router.get(
  "/orders/active",
  authMiddleware,
  requireDeliveryOrAdmin,
  getActiveOrders
);
```

### Opción 2: Usar middlewares personalizados

```javascript
import {
  requireRole,
  requireAllRoles,
} from "../middlewares/role.middleware.js";

// Usuario debe tener AL MENOS UNO de estos roles
router.post(
  "/special-action",
  authMiddleware,
  requireRole(["admin", "delivery"]),
  specialAction
);

// Usuario debe tener TODOS estos roles
router.post(
  "/super-action",
  authMiddleware,
  requireAllRoles(["admin", "delivery"]),
  superAction
);
```

### Opción 3: Verificación manual en controladores

```javascript
export const someController = async (req, res) => {
  const userRoles = req.roles || [];

  if (userRoles.includes("admin")) {
    // Lógica para admin
  } else if (userRoles.includes("delivery")) {
    // Lógica para repartidor
  } else {
    // Lógica para usuario normal
  }
};
```

## Agregar Rol de Repartidor a un Usuario

### Opción 1: Manualmente en la base de datos

```sql
-- Agregar rol de repartidor al usuario con uid 5
INSERT INTO user_roles (user_id, role)
VALUES (5, 'delivery')
ON CONFLICT (user_id, role) DO UPDATE SET is_active = true;
```

### Opción 2: Desde el código (cuando se aprueba solicitud)

```javascript
import { UserModel } from "../models/user.model.js";

// En el controlador de delivery-application cuando se aprueba
const approveApplication = async (req, res) => {
  const { applicationId } = req.params;

  // 1. Obtener la aplicación
  const application = await DeliveryApplicationModel.getById(applicationId);

  // 2. Actualizar estado de la aplicación
  await DeliveryApplicationModel.updateStatus(applicationId, "approved");

  // 3. Agregar rol de delivery al usuario
  await UserModel.addRole(application.user_id, "delivery");

  res.json({
    ok: true,
    message: "Application approved and delivery role assigned",
  });
};
```

## Ejemplo: Endpoint para cambiar de rol

```javascript
// En user.controller.js
export const switchRole = async (req, res) => {
  try {
    const { activeRole } = req.body;
    const userRoles = req.roles || [];

    // Verificar que el usuario tiene ese rol
    if (!userRoles.includes(activeRole)) {
      return res.status(403).json({
        ok: false,
        message: "No tienes ese rol asignado",
      });
    }

    // Generar nuevo token con el rol activo
    const token = jwt.sign(
      {
        uid: req.uid,
        email: req.email,
        roles: userRoles,
        activeRole, // Rol que el usuario quiere usar en este momento
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      ok: true,
      token,
      activeRole,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Server error" });
  }
};
```

## Frontend: Manejo de Múltiples Roles

```javascript
// login.js
async function login(email, password) {
  const response = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Si el usuario tiene múltiples roles, mostrar selector
    if (data.user.roles.length > 1) {
      showRoleSelector(data.user.roles);
    } else {
      // Redirigir según el único rol
      redirectByRole(data.user.roles[0]);
    }
  }
}

function redirectByRole(role) {
  switch (role) {
    case "admin":
      window.location.href = "/admin-dashboard.html";
      break;
    case "delivery":
      window.location.href = "/delivery-dashboard.html";
      break;
    default:
      window.location.href = "/user-inicio.html";
  }
}

function showRoleSelector(roles) {
  // Mostrar modal o selector para que el usuario elija qué rol usar
  const roleButtons = roles
    .map((role) => {
      return `<button onclick="selectRole('${role}')">${role}</button>`;
    })
    .join("");

  // Mostrar en UI
  document.getElementById("roleSelector").innerHTML = roleButtons;
}
```

## Verificación de Cambios

### Test 1: Registro de nuevo usuario

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Respuesta esperada:

```json
{
  "ok": true,
  "token": "...",
  "user": {
    "uid": 1,
    "email": "test@example.com",
    "username": "testuser",
    "roles": ["user"],
    "created_at": "2025-10-19T..."
  }
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test 3: Agregar rol delivery manualmente

```sql
INSERT INTO user_roles (user_id, role) VALUES (1, 'delivery');
```

Luego hacer login nuevamente y verificar que `roles` incluye `["user", "delivery"]`

## Notas Importantes

1. **Compatibilidad hacia atrás**: Los tokens viejos con `role` (singular) seguirán funcionando hasta que expiren (1 hora)

2. **Sesiones activas**: Los usuarios que ya están logueados necesitarán hacer login nuevamente para obtener el nuevo formato de token con `roles` (plural)

3. **Frontend**: Deberás actualizar el código frontend que use `user.role` para que use `user.roles` (array)

4. **Roles disponibles**:

   - `user`: Usuario normal (cliente)
   - `delivery`: Repartidor
   - `admin`: Administrador

5. **Flexibilidad**: Un usuario puede tener múltiples roles simultáneamente, por ejemplo: `["user", "delivery"]`
