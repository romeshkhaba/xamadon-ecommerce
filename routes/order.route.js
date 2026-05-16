import express from "express";
import * as orderController from "../controllers/order.controller.js";
import {
  checkoutDTO,
  previewOrderDTO,
  stripeCheckoutPaymentStatusDTO,
  updateOrderStatusDTO,
  updatePaymentStatusDTO,
} from "../dto/order.dto.js";
import asyncHandler from "../middleware/async-handler.js";
import authenticate from "../middleware/authenticate.js";
import authorizeAdmin from "../middleware/authorize-admin.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router.use(authenticate);

router.get("/", asyncHandler(orderController.getOrders));
router.get("/current-checkout", asyncHandler(orderController.getCurrentCheckout));
router.post("/preview", validate(previewOrderDTO), asyncHandler(orderController.previewOrder));
router.post("/checkout", validate(checkoutDTO), asyncHandler(orderController.checkout));
router.post(
  "/checkout/payment-status",
  validate(stripeCheckoutPaymentStatusDTO),
  asyncHandler(orderController.checkStripeCheckoutPayment)
);
router.get(
  "/checkout/payment-status",
  asyncHandler(orderController.checkStripeCheckoutPayment)
);
router.get(
  "/checkout-session/:sessionId/payment-status",
  asyncHandler(orderController.checkStripeCheckoutPayment)
);
router.get("/:orderId", asyncHandler(orderController.getOrderById));
router.post("/:orderId/retry-payment", asyncHandler(orderController.retryPayment));
router.post("/:orderId/cancel", asyncHandler(orderController.cancelOrder));

export default router;
