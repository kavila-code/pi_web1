# 🐛 Solución del Error de Login

## Problema Encontrado

Cuando intentabas iniciar sesión, salía el error: **"Server error"**

## Causa Raíz

La tabla `user_roles` fue creada sin las columnas `assigned_at` y `is_active`, pero el código de los modelos las estaba esperando.

### Error específico:

```
error: no existe la columna ur.is_active
```

## Solución Aplicada

### ✅ Paso 1: Diagnóstico

Ejecuté `test-login-debug.js` que reveló:

- ✅ Tabla `user_roles` existía
- ✅ Columna `role` eliminada de `users`
- ❌ Faltaban columnas `assigned_at` y `is_active`

### ✅ Paso 2: Corrección

Creé y ejecuté el script `database/fix-user-roles.js` que:

1. Agregó columna `assigned_at` (TIMESTAMP)
2. Agregó columna `is_active` (BOOLEAN)
3. Actualizó registros existentes
4. Creó índices para mejor rendimiento
5. Agregó constraint UNIQUE

### ✅ Paso 3: Verificación

Confirmé que todos los usuarios tienen roles asignados correctamente.

## Estructura Final de `user_roles`

```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'delivery', 'admin')),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, role)
);
```

## Prueba de Funcionamiento

### Usuario de prueba encontrado:

```json
{
  "uid": 2,
  "username": "kelly",
  "email": "kelly@example.com",
  "roles": ["user"]
}
```

## ✅ Estado Actual

- ✅ Tabla `user_roles` con estructura completa
- ✅ Todos los usuarios tienen roles asignados
- ✅ Método `findOneByEmailWithPassword()` funciona correctamente
- ✅ Sistema listo para login

## Cómo Probar

### Opción 1: Desde el navegador

1. Abre `http://localhost:3000/login.html`
2. Ingresa credenciales
3. Deberías poder iniciar sesión correctamente

### Opción 2: Test manual

```bash
node test-login-manual.js
```

### Opción 3: Con curl

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kelly@example.com","password":"tu_password"}'
```

## Scripts Creados para Debug

1. **`test-login-debug.js`** - Diagnóstico completo del sistema
2. **`check-table-structure.js`** - Verificar estructura de tablas
3. **`database/fix-user-roles.js`** - Corregir tabla user_roles
4. **`test-login-manual.js`** - Probar login manualmente

## Próximos Pasos

Si quieres probar el sistema completo de múltiples roles:

### Agregar rol de delivery a un usuario:

```sql
INSERT INTO user_roles (user_id, role)
VALUES (2, 'delivery')
ON CONFLICT (user_id, role) DO NOTHING;
```

Luego al hacer login, ese usuario tendrá:

```json
{
  "roles": ["user", "delivery"]
}
```

## 🎉 ¡Problema Resuelto!

El login ahora debería funcionar correctamente con el nuevo sistema de roles múltiples.
