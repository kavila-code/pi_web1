import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
const deliveryUploadsDir = path.join(uploadsDir, 'delivery-applications');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(deliveryUploadsDir)) {
  fs.mkdirSync(deliveryUploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, deliveryUploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: userId_timestamp_fieldname.extension
    const userId = req.user?.uid || 'unknown';
    const timestamp = Date.now();
    const fieldName = file.fieldname;
    const extension = path.extname(file.originalname);
    
    const filename = `${userId}_${timestamp}_${fieldName}${extension}`;
    cb(null, filename);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedTypes = {
    'cv': ['.pdf', '.doc', '.docx'],
    'id_document': ['.jpg', '.jpeg', '.png', '.pdf'],
    'license_photo': ['.jpg', '.jpeg', '.png', '.pdf']
  };

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fieldName = file.fieldname;

  if (allowedTypes[fieldName] && allowedTypes[fieldName].includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido para ${fieldName}. Tipos permitidos: ${allowedTypes[fieldName]?.join(', ')}`), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite por archivo
  }
});

// Middleware para múltiples archivos de delivery application
export const uploadDeliveryFiles = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'id_document', maxCount: 1 },
  { name: 'license_photo', maxCount: 1 }
]);

// Middleware para manejar errores de multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Tipo de archivo no esperado'
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

export default upload;