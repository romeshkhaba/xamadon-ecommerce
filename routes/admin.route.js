import express from 'express';
import {
  adminUpdateOrderDTO,
  updateOrderStatusDTO,
  updatePaymentStatusDTO,
} from '../dto/order.dto.js';
import { createProductDTO, updateProductDTO } from '../dto/product.dto.js';
import * as orderController from '../controllers/order.controller.js';
import * as productController from '../controllers/product.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorizeAdmin from '../middleware/authorize-admin.js';
import asyncHandler from '../middleware/async-handler.js';
import validate from '../middleware/validate.js';

const router = express.Router();
router.use(authenticate);
router.use(authorizeAdmin);

router.get("/orders", asyncHandler(orderController.getAdminOrders));

router.get(
  "/orders/:orderId",
  asyncHandler(orderController.getAdminOrderById)
);
router.patch(
  "/orders/:orderId",
  validate(adminUpdateOrderDTO),
  asyncHandler(orderController.updateAdminOrder)
);

router.patch(
  "/orders/:orderId/status",
  validate(updateOrderStatusDTO),
  asyncHandler(orderController.updateOrderStatus)
);
router.patch(
  "/orders/:orderId/payment-status",
  validate(updatePaymentStatusDTO),
  asyncHandler(orderController.updatePaymentStatus)
);

router.get(
  '/products',
  asyncHandler(productController.getAdminProducts)
);
router.post(
  '/products',
  validate(createProductDTO),
  asyncHandler(productController.createProduct)
);
router.get(
  '/products/:id',
  asyncHandler(productController.getProductById)
);
router.patch(
  '/products/:id',
  validate(updateProductDTO),
  asyncHandler(productController.updateProduct)
);
router.delete(
  '/products/:id',
  asyncHandler(productController.deleteProduct)
);

export default router;
