import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { AppError } from './error-response.js';

const uploadsDir = path.resolve(process.cwd(), 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const basename = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${basename || 'product'}-${uniqueSuffix}${extension}`);
  },
});

const multerUpload = multer({
  storage,
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
