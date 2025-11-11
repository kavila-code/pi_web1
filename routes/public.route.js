import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta de la carpeta public
const publicPath = path.join(__dirname, '../public');

// Ruta principal (index.html)
router.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Login
router.get('/login', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

// Profile
router.get('/profile', (req, res) => {
    res.sendFile(path.join(publicPath, 'profile.html'));
});

// Admin Dashboard
router.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin-dashboard.html'));
});

// User Dashboard
router.get('/user-dashboard', (req, res) => {
    res.sendFile(path.join(publicPath, 'user-dashboard.html'));
});

// Delivery (Domiciliario) Dashboard
router.get('/delivery-dashboard', (req, res) => {
    res.sendFile(path.join(publicPath, 'delivery-dashboard.html'));
});

// User Inicio
router.get('/user-inicio', (req, res) => {
    res.sendFile(path.join(publicPath, 'user-inicio.html'));
});

// Test page
router.get('/test-logout', (req, res) => {
    res.sendFile(path.join(publicPath, 'test-logout.html'));
});
// (product.html and restaurant.html are served via static files or modal preview; explicit routes removed)

export default router;
