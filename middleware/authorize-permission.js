import { hasModulePermission } from '../utils/admin.js';
import { AppError } from './error-response.js';

export default function authorizePermission(moduleName, action) {
  return function requirePermission(req, res, next) {
    if (!hasModulePermission(req.user, moduleName, action)) {
      return next(new AppError('Permission denied', 403));
    }

    next();
  };
}
