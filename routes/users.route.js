import express from 'express';
import asyncHandler from '../middleware/async-handler.js';
import * as userController from '../controllers/user.controller.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();
router.use(authenticate);

router.get("/", asyncHandler(userController.getAllUsers));
router.get("/:id", asyncHandler(userController.getUserById));
router.get("/profile", asyncHandler(userController.getProfile));

export default router;
