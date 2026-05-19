import multer from 'multer';
import { AppError } from './error-response.js';

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      cb(new AppError('Only image files are allowed', 400));
      return;
    }

    cb(null, true);
  },
}).single('image');

export default function uploadProductImage(req, res, next) {
  multerUpload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(new AppError('Image file size must be 5MB or less', 400));
      return;
    }

    next(error);
  });
}
