import express from 'express';
import {
  adminUpdateOrderDTO,
  updateOrderStatusDTO,
  updatePaymentStatusDTO,
} from '../dto/order.dto.js';
import { createPermissionDTO, updatePermissionDTO } from '../dto/permission.dto.js';
import { updateRatingDTO } from '../dto/rating.dto.js';
import { createProductDTO, updateProductDTO } from '../dto/product.dto.js';
import { createRoleModuleDTO, updateRoleModuleDTO } from '../dto/role-module.dto.js';
import { assignUserRoleDTO, createRoleDTO, updateRoleDTO } from '../dto/role.dto.js';
import { createAdminUserDTO, updateAdminUserDTO } from '../dto/user.dto.js';
import * as orderController from '../controllers/order.controller.js';
import * as permissionController from '../controllers/permission.controller.js';
import * as productController from '../controllers/product.controller.js';
import * as ratingController from '../controllers/rating.controller.js';
import * as roleModuleController from '../controllers/role-module.controller.js';
import * as roleController from '../controllers/role.controller.js';
import * as userController from '../controllers/user.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorizeAdmin from '../middleware/authorize-admin.js';
import authorizePermission from '../middleware/authorize-permission.js';
import asyncHandler from '../middleware/async-handler.js';
import uploadProductImage from '../middleware/upload-product-image.js';
import validate from '../middleware/validate.js';

const can = (moduleName, action) => authorizePermission(moduleName, action);

const router = express.Router();
router.use(authenticate);

router.post(
  '/users',
  can('users', 'write'),
  validate(createAdminUserDTO),
  asyncHandler(userController.createUserByAdmin)
);

router.use(authorizeAdmin);

router.get('/me', asyncHandler(userController.getProfile));

router.get(
  '/users',
  can('users', 'read'),
  asyncHandler(userController.getAllUsers)
);
router.get(
  '/users/:id',
  can('users', 'read'),
  asyncHandler(userController.getUserById)
);
router.patch(
  '/users/:id',
  can('users', 'write'),
  validate(updateAdminUserDTO),
  asyncHandler(userController.updateAdminUser)
);
router.delete(
  '/users/:id',
  can('users', 'delete'),
  asyncHandler(userController.deleteAdminUser)
);
router.patch(
  '/users/:id/role',
  can('users', 'write'),
  validate(assignUserRoleDTO),
  asyncHandler(userController.assignUserRole)
);

router.get(
  '/roles',
  can('roles', 'read'),
  asyncHandler(roleController.getRoles)
);
router.post(
  '/roles',
  can('roles', 'write'),
  validate(createRoleDTO),
  asyncHandler(roleController.createRole)
);
router.get(
  '/roles/:id',
  can('roles', 'read'),
  asyncHandler(roleController.getRoleById)
);
router.patch(
  '/roles/:id',
  can('roles', 'write'),
  validate(updateRoleDTO),
  asyncHandler(roleController.updateRole)
);
router.delete(
  '/roles/:id',
  can('roles', 'write'),
  asyncHandler(roleController.deleteRole)
);

router.get(
  '/role-modules',
  can('roleModules', 'read'),
  asyncHandler(roleModuleController.getRoleModules)
);
router.post(
  '/role-modules',
  can('roleModules', 'write'),
  validate(createRoleModuleDTO),
  asyncHandler(roleModuleController.createRoleModule)
);
router.get(
  '/role-modules/:id',
  can('roleModules', 'read'),
  asyncHandler(roleModuleController.getRoleModuleById)
);
router.patch(
  '/role-modules/:id',
  can('roleModules', 'write'),
  validate(updateRoleModuleDTO),
  asyncHandler(roleModuleController.updateRoleModule)
);
router.delete(
  '/role-modules/:id',
  can('roleModules', 'write'),
  asyncHandler(roleModuleController.deleteRoleModule)
);

router.get(
  '/permissions',
  can('permissions', 'read'),
  asyncHandler(permissionController.getPermissions)
);
router.post(
  '/permissions',
  can('permissions', 'write'),
  validate(createPermissionDTO),
  asyncHandler(permissionController.createPermission)
);
router.get(
  '/permissions/:id',
  can('permissions', 'read'),
  asyncHandler(permissionController.getPermissionById)
);
router.patch(
  '/permissions/:id',
  can('permissions', 'write'),
  validate(updatePermissionDTO),
  asyncHandler(permissionController.updatePermission)
);
router.delete(
  '/permissions/:id',
  can('permissions', 'write'),
  asyncHandler(permissionController.deletePermission)
);

router.get(
  "/orders",
  can('orders', 'read'),
  asyncHandler(orderController.getAdminOrders)
);

router.get(
  "/orders/:orderId",
  can('orders', 'read'),
  asyncHandler(orderController.getAdminOrderById)
);
router.patch(
  "/orders/:orderId",
  can('orders', 'write'),
  validate(adminUpdateOrderDTO),
  asyncHandler(orderController.updateAdminOrder)
);

router.patch(
  "/orders/:orderId/status",
  can('orders', 'write'),
  validate(updateOrderStatusDTO),
  asyncHandler(orderController.updateOrderStatus)
);
router.patch(
  "/orders/:orderId/payment-status",
  can('orders', 'write'),
  validate(updatePaymentStatusDTO),
  asyncHandler(orderController.updatePaymentStatus)
);

router.get(
  '/products',
  can('products', 'read'),
  asyncHandler(productController.getAdminProducts)
);
router.post(
  '/products',
  can('products', 'write'),
  validate(createProductDTO),
  asyncHandler(productController.createProduct)
);
router.post(
  '/products/upload-image',
  can('products', 'write'),
  uploadProductImage,
  asyncHandler(productController.uploadProductImage)
);
router.get(
  '/products/:id',
  can('products', 'read'),
  asyncHandler(productController.getProductById)
);
router.patch(
  '/products/:id',
  can('products', 'write'),
  validate(updateProductDTO),
  asyncHandler(productController.updateProduct)
);
router.delete(
  '/products/:id',
  can('products', 'delete'),
  asyncHandler(productController.deleteProduct)
);

router.get(
  '/ratings',
  can('ratings', 'read'),
  asyncHandler(ratingController.getAllRatings)
);
router.patch(
  '/ratings/:ratingId',
  can('ratings', 'write'),
  validate(updateRatingDTO),
  asyncHandler(ratingController.adminUpdateRating)
);
router.delete(
  '/ratings/:ratingId',
  can('ratings', 'delete'),
  asyncHandler(ratingController.adminDeleteRating)
);

export default router;
