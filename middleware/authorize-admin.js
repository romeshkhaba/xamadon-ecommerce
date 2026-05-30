import { AppError } from './error-response.js';
import { hasAdminAccess } from '../utils/admin.js';

export default function authorizeDashboardAccess(req, res, next) {
  if (!hasAdminAccess(req.user)) {
    return next(new AppError('Dashboard access required', 403));
  }

  next();
}
