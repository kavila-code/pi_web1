import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/delivery-applications/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes y PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen y PDF'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Middleware para aplicaciones de delivery
export const uploadDeliveryDocuments = upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'soat', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]);

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ ok: false, msg: 'File too large' });
    }
  }
  if (error.message === 'Solo se permiten archivos de imagen y PDF') {
    return res.status(400).json({ ok: false, msg: error.message });
  }
  next(error);
};