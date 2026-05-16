import { addressResponse } from "./address-response.dto.js";

function asPlainRecord(model) {
  if (model && typeof model.get === "function") {
    return model.get({ plain: true });
  }

  return model;
}

function toMoneyNumber(value) {
  return Number(Number(value ?? 0).toFixed(2));
}

function orderItemResponse(itemModel) {
  const item = asPlainRecord(itemModel);
  const quantity = Number(item.quantity ?? 0);
  const unitPrice = toMoneyNumber(item.unitPrice);

  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    productSku: item.productSku,
    productImage: item.productImage,
    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,
    quantity,
    unitPrice,
    lineTotal: toMoneyNumber(item.lineTotal ?? unitPrice * quantity),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function orderUserResponse(userModel) {
  const user = asPlainRecord(userModel);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.isAdmin),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function orderResponse(orderModel) {
  const order = asPlainRecord(orderModel);

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    user: orderUserResponse(order.user),
    addressId: order.addressId,
    address: addressResponse(order.address),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentProvider: order.paymentProvider,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    currency: order.currency,
    subtotal: toMoneyNumber(order.subtotal),
    shippingAmount: toMoneyNumber(order.shippingAmount),
    taxAmount: toMoneyNumber(order.taxAmount),
    discountAmount: toMoneyNumber(order.discountAmount),
    totalAmount: toMoneyNumber(order.totalAmount),
    items: (order.items ?? []).map(orderItemResponse),
    user: order.user ?? {},
    placedAt: order.placedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
