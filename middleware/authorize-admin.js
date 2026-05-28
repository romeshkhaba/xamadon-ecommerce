import { AppError } from './error-response.js';
import { hasAdminAccess } from '../utils/admin.js';

export default function authorizeAdmin(req, res, next) {
  if (!hasAdminAccess(req.user)) {
    return next(new AppError('Admin access required', 403));
  }

  next();
}
