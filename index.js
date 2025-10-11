import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import userRouter from './routes/user.route.js';
import adminRouter from './routes/admin.route.js';
import publicRouter from './routes/public.route.js';

const app = express();

// Servir archivos estáticos
app.use('/frontend', express.static('frontend'));
app.use('/public', express.static('public'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



// Rutas
app.use('/', publicRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);

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



