import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import userRouter from './routes/user.route.js';
import adminRouter from './routes/admin.route.js';
import publicRouter from './routes/public.route.js';
import deliveryApplicationsRouter from './routes/delivery-applications.route.js';
import restaurantRouter from './routes/restaurant.route.js';
import productRouter from './routes/product.route.js';
import orderRouter from './routes/order.route.js';

const app = express();

// Obtener __dirname en ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos
app.use('/frontend', express.static('frontend'));
app.use('/public', express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos subidos

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



// Rutas
app.use('/', publicRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/delivery-applications', deliveryApplicationsRouter);
app.use('/api/v1', restaurantRouter);
app.use('/api/v1', productRouter);
app.use('/api/v1', orderRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Configuración del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});



