# � DomiTulua - Plataforma de Delivery

> **Proyecto Universitario** - Ingeniería de Sistemas, UCEVA

Sistema web completo de gestión de pedidos de comida a domicilio, desarrollado con arquitectura MVC, autenticación JWT y sistema de roles (clientes, domiciliarios, administradores).

---

## 👥 Equipo de Desarrollo

| Nombre                    | Código    | Rol                     |
| ------------------------- | --------- | ----------------------- |
| **Kelly Ávila**           | 230241031 | Full-Stack Developer    |
| **Cristian Hoyos**        | 230241038 | Backend                 |
| **Juan Fernando Ramírez** | 230241041 | Backend                 |
| **Juan David Salazar**    | 230241006 | Testing & Documentation |

---

## 📚 Asignatura

**Desarrollo en Ambientes Web I y Base de Datos**  
Unidad Central del Valle (UCEVA)

---

## 🎯 Características Principales

### 🔐 Sistema de Autenticación

- Registro e inicio de sesión con JWT
- Roles de usuario: Cliente, Domiciliario, Administrador
- Protección de rutas según rol
- Middleware de validación y autenticación

### 👤 Panel de Usuario

- Dashboard personalizado con estadísticas
- Gestión de perfil
- Historial de pedidos
- Restaurantes favoritos
- Direcciones y métodos de pago

### 🚴 Sistema de Domiciliarios

- Formulario de solicitud multi-paso (4 pasos)
- Carga de documentos (CV, documento de identidad, licencia)
- Disponibilidad horaria y zonas de trabajo
- Dashboard específico para domiciliarios
- Transición automática de rol al ser aprobado

### 👨‍💼 Panel de Administración

- Dashboard con estadísticas en tiempo real
- Gestión de usuarios
- Revisión de solicitudes de domiciliarios
- Aprobación/rechazo con observaciones
- Previsualización de documentos
- Sistema de notificaciones
- Filtros y búsqueda avanzada

---

## 🛠️ Tecnologías Utilizadas

### Frontend

- **HTML5** - Estructura semántica
- **CSS3** (Bootstrap 5) - Diseño responsivo y moderno
- **JavaScript (ES6+)** - Lógica del cliente
- **Chart.js** - Visualización de datos
- **Bootstrap Icons** - Iconografía

### Backend

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **JWT** - Autenticación segura
- **bcrypt** - Encriptación de contraseñas
- **Multer** - Manejo de archivos

### Base de Datos

- **PostgreSQL** - Base de datos relacional
- **pg** - Cliente de PostgreSQL para Node.js
- Modelos: users, delivery_applications

### Arquitectura

- **MVC (Modelo-Vista-Controlador)** - Organización del código
- **RESTful API** - Comunicación cliente-servidor
- **Middleware Chain** - Validación y autenticación

### DevOps & Tools

- **Git & GitHub** - Control de versiones
- **npm** - Gestión de dependencias
- **dotenv** - Variables de entorno

---

## 📁 Estructura del Proyecto

```
pi_web/
├── controllers/           # Lógica de negocio
│   ├── user.controller.js
│   ├── admin.controller.js
│   └── delivery-application.controller.js
├── models/               # Modelos de datos
│   ├── user.model.js
│   └── delivery-application.model.js
├── routes/              # Definición de rutas
│   ├── user.route.js
│   ├── public.route.js
│   └── test.route.js
├── middlewares/         # Middleware de validación
│   ├── auth.middleware.js
│   └── validate.middleware.js
├── database/            # Configuración de BD
│   └── connection.database.js
├── public/              # Archivos estáticos
│   ├── index.html
│   ├── login.html
│   ├── user-dashboard.html
│   ├── admin-dashboard.html
│   └── delivery-dashboard.html
├── frontend/            # Estilos CSS
│   ├── foodie.css
│   └── login.css
├── uploads/             # Archivos subidos
│   └── delivery-applications/
├── index.js            # Punto de entrada
└── package.json        # Dependencias
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- Git

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/kavila-code/pi_web1.git
cd pi_web1
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**
   Crear archivo `.env` en la raíz:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db
JWT_SECRET=tu_secreto_jwt_muy_seguro
PORT=3000
```

4. **Crear base de datos**

```sql
CREATE DATABASE nombre_db;
```

5. **Ejecutar migraciones**

```bash
node database/migrations/create-tables.sql
```

6. **Iniciar servidor**

```bash
npm start
```

7. **Acceder a la aplicación**

```
http://localhost:3000
```

---

## 📊 Alcances del Proyecto

✅ **Modelamiento UML** - Diagramas de casos de uso, clases y secuencia  
✅ **Arquitectura MVC** - Separación clara de responsabilidades  
✅ **Frontend Moderno** - HTML5, CSS3, Bootstrap 5, JavaScript ES6+  
✅ **Base de Datos** - PostgreSQL con relaciones y consultas optimizadas  
✅ **Integración BD-Web** - API RESTful con autenticación JWT  
✅ **Control de Versiones** - Git con commits descriptivos y branches organizadas  
✅ **Sistema de Roles** - Permisos diferenciados por tipo de usuario  
✅ **Carga de Archivos** - Manejo seguro de documentos  
✅ **Validaciones** - Frontend y backend con mensajes de error claros

---

## 🎨 Capturas de Pantalla

### Dashboard de Usuario

![User Dashboard](https://via.placeholder.com/800x400?text=User+Dashboard)

### Panel de Administración

![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

### Formulario de Solicitud

![Application Form](https://via.placeholder.com/800x400?text=Application+Form)

---

## 🧪 Testing

El proyecto incluye archivos de prueba para verificar funcionalidad:

- `test-delivery.js` - Pruebas de sistema de domiciliarios
- `test-document-urls.js` - Verificación de URLs de documentos
- `update-database.js` - Scripts de migración

**Ejecutar tests:**

```bash
node test-delivery.js
```

---

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (10 rounds)
- Autenticación con JWT (tokens con expiración)
- Validación de entrada en frontend y backend
- Protección contra inyección SQL con consultas parametrizadas
- CORS configurado
- Middleware de autenticación en rutas protegidas

---

## 📈 Roadmap Futuro

- [ ] Integración con pasarelas de pago (PSE, tarjetas)
- [ ] Sistema de pedidos en tiempo real
- [ ] Tracking GPS de domiciliarios
- [ ] Notificaciones push
- [ ] Chat en vivo soporte/cliente
- [ ] App móvil con React Native
- [ ] Calificaciones y reseñas
- [ ] Programa de fidelización

---

## 🤝 Contribución

Este es un proyecto universitario, pero aceptamos sugerencias y mejoras:

1. Fork del proyecto
2. Crear branch (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push al branch (`git push origin feature/mejora`)
5. Crear Pull Request

---

## 📄 Licencia

Este proyecto es desarrollado con fines educativos para la UCEVA.

---

## 📞 Contacto

**Universidad:** Unidad Central del Valle (UCEVA)  
**Programa:** Ingeniería de Sistemas  
**Repositorio:** [github.com/kavila-code/pi_web1](https://github.com/kavila-code/pi_web1)

---

## 🙏 Agradecimientos

- Profesores de Desarrollo Web y Base de Datos - UCEVA
- Comunidad de desarrollo web
- Stack Overflow y documentación oficial

---

**Hecho con ❤️ por el equipo de Ingeniería de Sistemas - UCEVA 2025**
