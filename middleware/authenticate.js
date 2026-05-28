import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Permission from '../models/permission.model.js';
import Role from '../models/role.model.js';
import RoleModule from '../models/role-module.model.js';
import { AppError } from './error-response.js';

export default async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization token is required', 401));
  }

  const token = authHeader.slice(7).trim();

  try {
    const jwtSecret = process.env.JWT_SECRET || 'JWT_SECRET';
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(payload.id, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: RoleModule,
              as: 'roleModules',
              include: [
                {
                  model: Permission,
                  as: 'permission',
                },
              ],
            },
          ],
        },
      ],
    });

    if (!user) {
      return next(new AppError('User not found for this token', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
}
