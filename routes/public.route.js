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

export default router;
