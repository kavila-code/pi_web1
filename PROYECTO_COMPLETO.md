# 📋 ANÁLISIS COMPLETO DEL PROYECTO - DomiTulua

## 🎯 **INFORMACIÓN GENERAL**

### **Proyecto:** DomiTulua - Plataforma de Solicitudes para Domiciliarios
### **Tipo:** Aplicación Web Full-Stack
### **Universidad:** UCEVA (Unidad Central del Valle)
### **Asignatura:** Desarrollo en Ambientes Web I y Bases de Datos

### **Integrantes:**
- Kelly Ávila - 230241031
- Cristian Hoyos - 230241038
- Juan Fernando Ramirez - 230241041
- Juan David Salazar - 230241006

---

## 🛠️ **STACK TECNOLÓGICO**

### **Backend:**
- **Node.js** v22.18.0 con ES6 modules
- **Express.js** v5.1.0 (Framework web)
- **PostgreSQL** (Base de datos)
- **Multer** v2.0.2 (Manejo de archivos)
- **JWT** (Autenticación y autorización)
- **Bcrypt** (Encriptación de contraseñas)

### **Frontend:**
- **HTML5** semántico
- **CSS3** con Flexbox/Grid
- **Bootstrap 5.3.0** (Framework CSS)
- **JavaScript** vanilla (ES6+)
- **Chart.js** (Gráficos y estadísticas)
- **Bootstrap Icons** (Iconografía)

### **Herramientas de Desarrollo:**
- **Nodemon** (Desarrollo en tiempo real)
- **Git/GitHub** (Control de versiones)
- **VS Code** (Editor)
- **dotenv** (Variables de entorno)

---

## 📁 **ESTRUCTURA DEL PROYECTO**

```
pi_web/
├── 📂 controllers/           # Lógica de negocio
│   ├── user.controller.js
│   └── delivery-application.controller.js
├── 📂 database/              # Configuración de BD
│   ├── connection.database.js
│   └── update_delivery_applications.sql
├── 📂 frontend/              # Estilos CSS
│   ├── foodie.css
│   ├── login.css
│   └── admin-dashboard.css
├── 📂 middlewares/           # Middleware personalizado
│   ├── auth.middleware.js
│   ├── admin.middleware.js
│   ├── validate.middleware.js
│   └── file-upload.middleware.js
├── 📂 models/                # Modelos de datos
│   ├── user.model.js
│   └── delivery-application.model.js
├── 📂 public/                # Páginas web
│   ├── index.html
│   ├── login.html
│   ├── profile.html
│   ├── user-dashboard.html
│   └── admin-dashboard.html
├── 📂 routes/                # Definición de rutas
│   ├── public.route.js
│   ├── user.route.js
│   ├── admin.route.js
│   └── delivery-applications.route.js
├── 📂 uploads/               # Archivos subidos
│   └── delivery-applications/
├── 📂 utils/                 # Scripts de utilidad
│   ├── debug-document-paths.js
│   ├── fix-document-paths.js
│   └── test-document-urls.js
├── index.js                  # Servidor principal
├── package.json              # Dependencias
└── .env                      # Variables de entorno
```

---

## 🗄️ **BASE DE DATOS**

### **Tablas Principales:**

#### **1. users**
```sql
- uid (Primary Key)
- username 
- email
- password (encriptada)
- role (user/admin/domiciliario)
- created_at
```

#### **2. delivery_applications**
```sql
- id (Primary Key)
- user_id (Foreign Key → users.uid)
- full_name
- phone
- address
- birth_date
- document_id
- vehicle_type (a_pie/bicicleta/moto/carro)
- has_license (boolean)
- license_number
- work_zones (JSON)
- availability_schedule (JSON)
- previous_experience (text)
- why_delivery (text)
- customer_service_experience (text)
- cv_file_path
- id_document_path
- license_photo_path
- status (pendiente/aprobada/rechazada)
- observaciones
- fecha_solicitud
- fecha_revision
- admin_id
```

---

## 🎨 **FUNCIONALIDADES IMPLEMENTADAS**

### **👤 Sistema de Usuarios:**
- ✅ Registro de usuarios con validación
- ✅ Login con JWT tokens
- ✅ Roles (user, admin, domiciliario)
- ✅ Middleware de autenticación
- ✅ Middleware de autorización por roles

### **📝 Sistema de Solicitudes:**
- ✅ **Formulario multi-paso (4 etapas):**
  1. **Información Personal:** Nombres, teléfono, dirección, documento
  2. **Datos de Transporte:** Vehículo, licencia, información técnica
  3. **Disponibilidad:** Horarios, zonas de trabajo, experiencia
  4. **Documentos:** Carga de CV, cédula, licencia

### **📂 Sistema de Archivos:**
- ✅ Upload de documentos con Multer
- ✅ Validación de tipos de archivo (PDF, DOC, DOCX, JPG, PNG)
- ✅ Límite de tamaño (5MB por archivo)
- ✅ Nombres únicos para evitar conflictos
- ✅ Organización por carpetas con fecha

### **👨‍💼 Panel Administrativo:**
- ✅ **Dashboard completo con:**
  - Estadísticas en tiempo real
  - Gráficos con Chart.js
  - Actividad reciente
  - Métricas de rendimiento

- ✅ **Gestión de Solicitudes:**
  - Vista de todas las solicitudes
  - Filtros por estado y vehículo
  - Búsqueda en tiempo real
  - Previsualización de documentos en modales
  - Aprobación/rechazo con observaciones
  - Sistema de notificaciones

### **🔍 Funcionalidades Avanzadas:**
- ✅ **Vista previa de documentos:**
  - PDFs con iframe
  - Imágenes con zoom
  - Manejo de errores robusto
  - Enlaces de descarga directa

- ✅ **Sistema de notificaciones:**
  - Toast notifications con Bootstrap
  - Diferentes tipos (success, warning, error)
  - Auto-dismiss configurable

- ✅ **Filtros y búsqueda:**
  - Filtro por estado de solicitud
  - Filtro por tipo de vehículo
  - Búsqueda por nombre/email
  - Limpiar filtros

---

## 🚀 **APIs IMPLEMENTADAS**

### **Autenticación:**
- `POST /api/v1/users/register` - Registro de usuarios
- `POST /api/v1/users/login` - Inicio de sesión
- `GET /api/v1/users/profile` - Perfil del usuario

### **Solicitudes de Domiciliarios:**
- `POST /api/v1/delivery-applications/apply` - Crear solicitud
- `GET /api/v1/delivery-applications/my-application` - Ver mi solicitud
- `GET /api/v1/delivery-applications/all` - Ver todas (admin)
- `GET /api/v1/delivery-applications/stats` - Estadísticas (admin)
- `GET /api/v1/delivery-applications/:id` - Ver solicitud específica (admin)
- `PUT /api/v1/delivery-applications/:id/status` - Actualizar estado (admin)
- `DELETE /api/v1/delivery-applications/:id` - Eliminar solicitud (admin)

### **Archivos Estáticos:**
- `/uploads/delivery-applications/*` - Servir documentos subidos
- `/frontend/*` - CSS y assets
- `/public/*` - Páginas HTML

---

## 🔐 **SEGURIDAD IMPLEMENTADA**

- ✅ **Autenticación JWT** con tokens seguros
- ✅ **Autorización por roles** (user/admin/domiciliario)
- ✅ **Encriptación de contraseñas** con bcrypt
- ✅ **Validación de archivos** (tipo y tamaño)
- ✅ **Middleware de validación** para endpoints críticos
- ✅ **Variables de entorno** para datos sensibles
- ✅ **Manejo de errores** robusto

---

## 🎯 **CARACTERÍSTICAS DESTACADAS**

### **🎨 UI/UX:**
- **Diseño responsivo** con Bootstrap 5
- **Interfaz moderna** con gradientes y animaciones
- **Formulario multi-paso** con progreso visual
- **Modales interactivos** para vista previa
- **Notificaciones en tiempo real**

### **⚡ Performance:**
- **Carga asíncrona** de datos
- **Lazy loading** para documentos
- **Optimización de consultas** SQL
- **Compresión de archivos**

### **🔧 Mantenibilidad:**
- **Arquitectura MVC** bien definida
- **Código modular** y reutilizable
- **Comentarios documentados**
- **Scripts de debug** incluidos

---

## 📊 **ESTADÍSTICAS DEL PROYECTO**

- **📁 Archivos:** ~25 archivos de código
- **📝 Líneas de código:** ~3,000+ líneas
- **🗄️ Tablas BD:** 2 tablas principales
- **🎯 Endpoints:** 12 APIs funcionales
- **📱 Páginas:** 5 páginas web completas
- **🔧 Funcionalidades:** 20+ características implementadas

---

## 🚀 **ESTADO ACTUAL**

### **✅ COMPLETADO:**
- [x] Sistema completo de autenticación
- [x] Formulario multi-paso para solicitudes
- [x] Panel administrativo funcional
- [x] Sistema de archivos con visualización
- [x] Base de datos estructurada
- [x] APIs REST completas
- [x] Seguridad implementada
- [x] UI/UX profesional

### **🔄 EN DESARROLLO:**
- Módulo de gestión de pedidos
- Sistema de restaurantes
- Reportes avanzados
- Notificaciones por email

### **💡 FUTURAS MEJORAS:**
- Implementar sistema de geolocalización
- Agregar chat en tiempo real
- Sistema de calificaciones
- Integración con pasarelas de pago
- Dashboard de métricas avanzadas

---

## 🏃‍♂️ **CÓMO EJECUTAR EL PROYECTO**

```bash
# 1. Clonar repositorio
git clone https://github.com/kavila-code/pi_web1.git

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env)
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_bd
JWT_SECRET=tu_clave_secreta

# 4. Ejecutar en desarrollo
npm run dev

# 5. Abrir en navegador
http://localhost:3000
```

---

## 🎓 **CUMPLIMIENTO DE OBJETIVOS ACADÉMICOS**

✅ **Aplicación de UML:** Modelado de base de datos y arquitectura
✅ **Patrón MVC:** Implementación completa y estructurada
✅ **HTML5 + CSS3:** Uso de estándares modernos
✅ **Bootstrap/Flexbox:** Framework CSS profesional
✅ **JavaScript:** Funcionalidades avanzadas del lado cliente
✅ **Base de Datos:** Integración PostgreSQL completa
✅ **Git/GitHub:** Control de versiones profesional

---

**🎯 Proyecto académico exitoso que demuestra competencias técnicas completas en desarrollo web full-stack**