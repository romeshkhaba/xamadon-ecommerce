import * as orderService from "../services/order.service.js";

export async function getOrders(req, res) {
  const orders = await orderService.getOrders(req.user.id);

  res.success(orders, "Orders retrieved successfully");
}

export async function getCurrentCheckout(req, res) {
  const checkout = await orderService.getCurrentCheckout(req.user.id);

  res.success(checkout, "Checkout retrieved successfully");
}

export async function previewOrder(req, res) {
  const preview = await orderService.previewOrder(req.user.id, req.validatedData);

  res.success(preview, "Order preview created successfully");
}

export async function checkout(req, res) {
  const order = await orderService.checkout(req.user, req.validatedData);
  const extra = order.clientSecret ? { clientSecret: order.clientSecret } : {};

  res.success(order, "Order created successfully", 201, extra);
}

export async function getOrderById(req, res) {
  const order = await orderService.getOrderById(req.user.id, req.params.orderId);

  res.success(order, "Order retrieved successfully");
}

export async function cancelOrder(req, res) {
  const order = await orderService.cancelOrder(req.user.id, req.params.orderId);

  res.success(order, "Order cancelled successfully");
}

export async function retryPayment(req, res) {
  const order = await orderService.retryPayment(req.user.id, req.params.orderId);

  res.success(order, "Payment retry created successfully");
}

export async function checkStripeCheckoutPayment(req, res) {
  const sessionId =
    req.params.sessionId ||
    req.validatedData?.sessionId ||
    req.validatedData?.session_id ||
    req.query.session_id ||
    req.query.sessionId;

  const payment = await orderService.checkStripeCheckoutPayment(
    req.user.id,
    sessionId
  );

  res.success(payment, "Payment status retrieved successfully");
}

export async function getAdminOrders(req, res) {
  const orders = await orderService.getAdminOrders(req.query);

  res.success(orders, "Admin orders retrieved successfully");
}

export async function getAdminOrderById(req, res) {
  const order = await orderService.getAdminOrderById(req.params.orderId);

  res.success(order, "Admin order retrieved successfully");
}

export async function updateAdminOrder(req, res) {
  const order = await orderService.updateAdminOrder(
    req.params.orderId,
    req.validatedData
  );

  res.success(order, "Admin order updated successfully");
}

export async function updateOrderStatus(req, res) {
  const order = await orderService.updateOrderStatus(
    req.params.orderId,
    req.validatedData.status
  );

  res.success(order, "Order status updated successfully");
}

export async function updatePaymentStatus(req, res) {
  const order = await orderService.updatePaymentStatus(
    req.params.orderId,
    req.validatedData.paymentStatus
  );

  res.success(order, "Payment status updated successfully");
}
