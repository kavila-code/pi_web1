# 🎯 REDIRECCIÓN POR ROLES - GUÍA COMPLETA

## 📊 Estado Actual de Usuarios

### 1. **test@test.com** (Admin)

- **Roles:** `['admin']`
- **Debería ir a:** `/public/admin-dashboard.html` ✅
- **Prioridad:** Alta (es admin)

### 2. **kelly@example.com** (Cliente)

- **Roles:** `['user']`
- **Debería ir a:** `/public/user-dashboard.html` ✅
- **Prioridad:** Normal (solo cliente)

### 3. **juan@ramirez.com** (Repartidor y Cliente)

- **Roles:** `['domiciliario', 'cliente']`
- **Debería ir a:** `/public/delivery-dashboard.html` ✅
- **Prioridad:** Alta (es repartidor)

---

## 🔧 Lógica de Redirección

El sistema usa **prioridad de roles**:

```javascript
if (roles.includes("admin")) {
  // 1ra prioridad: Admin Dashboard
  window.location.href = "/public/admin-dashboard.html";
} else if (roles.includes("delivery") || roles.includes("domiciliario")) {
  // 2da prioridad: Delivery Dashboard
  window.location.href = "/public/delivery-dashboard.html";
} else {
  // 3ra prioridad: User Dashboard (cliente normal)
  window.location.href = "/public/user-dashboard.html";
}
```

---

## ✅ Cómo Probar

### Paso 1: Limpiar caché del navegador

- Presiona **Ctrl + Shift + Delete**
- Selecciona "Caché" y "Cookies"
- Limpia

O simplemente presiona **Ctrl + F5** en la página de login

### Paso 2: Abrir consola del desarrollador

- Presiona **F12**
- Ve a la pestaña "Console"

### Paso 3: Hacer login

Verás logs como:

```
👤 Usuario: test@test.com
🎭 Roles: ['admin']
✅ Redirigiendo a Admin Dashboard
```

### Paso 4: Verificar redirección

**test@test.com** → `/public/admin-dashboard.html` ✅
**juan@ramirez.com** → `/public/delivery-dashboard.html` ✅  
**kelly@example.com** → `/public/user-dashboard.html` ✅

---

## 🐛 Si sigue sin funcionar

### Problema: Aún redirige mal

**Solución 1:** Verificar que los archivos dashboard existen

```
c:\Users\USUARIO\Documents\pi_web\public\admin-dashboard.html
c:\Users\USUARIO\Documents\pi_web\public\delivery-dashboard.html
c:\Users\USUARIO\Documents\pi_web\public\user-dashboard.html
```

**Solución 2:** Ver logs en consola

- Los logs te dirán exactamente qué roles detectó
- Y a dónde está redirigiendo

**Solución 3:** Cambiar roles manualmente

Si quieres cambiar los roles de español a inglés:

```sql
-- Cambiar "domiciliario" por "delivery"
UPDATE user_roles SET role = 'delivery' WHERE role = 'domiciliario';

-- Cambiar "cliente" por "user"
UPDATE user_roles SET role = 'user' WHERE role = 'cliente';
```

---

## 💡 Sistema de Múltiples Roles

Juan tiene **2 roles**: domiciliario y cliente

Esto significa que PODRÍA:

- Ver pedidos como cliente
- Ver pedidos como repartidor
- Tener un botón para **cambiar de vista** entre dashboards

### Implementación Futura (Opcional)

Podrías agregar un selector de rol en el header:

```html
<select id="roleSelector" onchange="switchDashboard(this.value)">
  <option value="delivery">Vista Repartidor</option>
  <option value="user">Vista Cliente</option>
</select>
```

```javascript
function switchDashboard(role) {
  if (role === "delivery") {
    window.location.href = "/public/delivery-dashboard.html";
  } else {
    window.location.href = "/public/user-dashboard.html";
  }
}
```

---

## 🎯 Prueba Ahora

1. Abre http://localhost:3000/login.html
2. Presiona F12 (consola)
3. Login con **test@test.com** / **password123**
4. Verifica que va a **/public/admin-dashboard.html**
5. Logout y prueba con **juan@ramirez.com** / **password123**
6. Verifica que va a **/public/delivery-dashboard.html**

✅ ¡Debería funcionar ahora!
