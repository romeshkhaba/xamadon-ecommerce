import express from 'express';
import asyncHandler from '../middleware/async-handler.js';
import * as userController from '../controllers/user.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorizeAdmin from '../middleware/authorize-admin.js';
import authorizePermission from '../middleware/authorize-permission.js';

const can = (moduleName, action) => authorizePermission(moduleName, action);

const router = express.Router();
router.use(authenticate);

router.get("/profile", asyncHandler(userController.getProfile));
router.get(
  "/",
  authorizeAdmin,
  can('users', 'read'),
  asyncHandler(userController.getAllUsers)
);
router.get(
  "/:id",
  authorizeAdmin,
  can('users', 'read'),
  asyncHandler(userController.getUserById)
);

export default router;
