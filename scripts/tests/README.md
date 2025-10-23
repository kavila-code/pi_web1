# Scripts de Testing y Utilidades

Esta carpeta contiene scripts de desarrollo, pruebas y utilidades que NO son necesarios para producción.

## ⚠️ Advertencia

Estos scripts son para **desarrollo y debugging** únicamente. No ejecutarlos en producción sin revisar el código.

## 📂 Contenido

### Scripts de Prueba (test-\*)

Scripts para probar funcionalidades específicas del sistema:

- Login y autenticación
- Endpoints de API
- Relaciones entre tablas
- Delivery applications
- Información de usuarios

### Scripts de Verificación (check-\*)

Revisan el estado de la base de datos:

- Estructura de tablas
- Roles de usuarios
- Constraints y relaciones

### Scripts de Corrección (fix-\*)

Solucionan problemas puntuales:

- Contraseñas
- Roles
- Paths de documentos

### Scripts de Utilidad

- `reset-passwords.js` - Resetear contraseñas de usuarios
- `update-database.js` - Actualizaciones misceláneas
- `standardize-roles.js` - Normalizar roles en user_roles
- `debug-document-paths.js` - Debuggear rutas de archivos

## 🔧 Uso

Ejecuta desde el raíz del proyecto:

```powershell
node ./scripts/tests/nombre-del-script.js
```

**Recuerda**: Estos scripts pueden modificar la base de datos. Úsalos con precaución.

## 📝 Notas

- Todos los scripts asumen que el servidor puede estar o no corriendo
- Requieren las variables de entorno configuradas en `.env`
- Algunos scripts requieren que existan usuarios/datos de prueba
