import sequelize from "../config/database.js";
import { cartResponse } from "../dto/cart-response.dto.js";
import { orderResponse } from "../dto/order-response.dto.js";
import { AppError } from "../middleware/error-response.js";
import { CartItem, Product } from "../models/associations.js";
import * as addressRepository from "../repositories/address.repository.js";
import * as cartRepository from "../repositories/cart.repository.js";
import * as orderRepository from "../repositories/order.repository.js";
import { createEmbeddedCheckoutSession, retrieveCheckoutSession } from "./stripe.service.js";

function toMoneyNumber(value) {
  return Number(Number(value ?? 0).toFixed(2));
}

function normalizeAddress(data) {
  return {
    name: data.name,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2 || null,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country.toUpperCase(),
  };
}

function getLineTotal(unitPrice, quantity) {
  return toMoneyNumber(toMoneyNumber(unitPrice) * Number(quantity ?? 0));
}

function calculateTotals(items) {
  const subtotal = toMoneyNumber(
    items.reduce((sum, item) => sum + getLineTotal(item.priceAtTime, item.quantity), 0)
  );

  return {
    subtotal,
    shippingAmount: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: subtotal,
  };
}

function makeOrderNumber() {
  const time = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `ORD-${time}-${suffix}`;
}

function cartItemsToOrderItems(orderId, items) {
  return items.map((item) => ({
    orderId,
    productId: item.productId,
    productName: item.product.name,
    productSku: item.product.sku,
    productImage: item.product.image,
    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,
    quantity: item.quantity,
    unitPrice: item.priceAtTime,
    lineTotal: getLineTotal(item.priceAtTime, item.quantity),
  }));
}

async function getCartWithItems(userId, options = {}) {
  const cart = await cartRepository.findCartByUserId(userId, options);

  if (!cart || !cart.items?.length) {
    throw new AppError("Your cart is empty", 400);
  }

  return cart;
}

async function resolveShippingAddress(userId, data, options = {}) {
  if (data.addressId) {
    const address = await addressRepository.findAddressById(
      userId,
      data.addressId,
      options
    );

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    return {
      addressId: address.id,
    };
  }

  const shippingAddress = normalizeAddress(data.shippingAddress);

  if (options.createAddress === false) {
    return {
      addressId: null,
    };
  }

  const orderAddress = await addressRepository.createAddress(
    userId,
    {
      ...shippingAddress,
      isDefault: false,
    },
    options
  );

  return {
    addressId: orderAddress.id,
  };
}

function assertItemsCanCheckout(items) {
  for (const item of items) {
    const product = item.product;

    if (!product || product.isActive === false) {
      throw new AppError(`${item.product?.name || "A product"} is not available`, 400);
    }

    const stock = Number(product.stock ?? 0);

    if (stock < item.quantity) {
      throw new AppError(`Only ${stock} ${product.name} item(s) left in stock`, 400);
    }
  }
}

async function getOrderForUserOrFail(userId, orderId, options = {}) {
  const order = await orderRepository.findOrderByIdForUser(userId, orderId, options);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
}

async function getOrderOrFail(orderId, options = {}) {
  const order = await orderRepository.findOrderById(orderId, options);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
}

function getPaymentIntentId(paymentIntent) {
  if (!paymentIntent) {
    return null;
  }

  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

function getOrderUpdateFromStripeSession(session, overridePaymentStatus = null) {
  const paymentStatus =
    overridePaymentStatus ||
    (session.payment_status === "paid"
      ? "paid"
      : session.status === "expired"
        ? "cancelled"
        : "pending");

  return {
    paymentStatus,
    ...(paymentStatus === "paid" && { status: "confirmed" }),
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: getPaymentIntentId(session.payment_intent),
  };
}

async function findOrderForStripeSession(session, options = {}) {
  const orderId = session.metadata?.orderId || session.client_reference_id;

  if (orderId) {
    const order = await orderRepository.findOrderById(orderId, options);

    if (order) {
      return order;
    }
  }

  return orderRepository.findOrderByStripeCheckoutSessionId(session.id, options);
}

export async function syncStripeCheckoutSession(session) {
  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await findOrderForStripeSession(session, { transaction });

    if (!existingOrder) {
      return null;
    }

    return orderRepository.updateOrder(
      existingOrder,
      getOrderUpdateFromStripeSession(session),
      { transaction }
    );
  });

  return order ? orderResponse(order) : null;
}

export async function markStripeCheckoutSessionFailed(session) {
  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await findOrderForStripeSession(session, { transaction });

    if (!existingOrder) {
      return null;
    }

    return orderRepository.updateOrder(
      existingOrder,
      getOrderUpdateFromStripeSession(session, "failed"),
      { transaction }
    );
  });

  return order ? orderResponse(order) : null;
}

export async function markStripePaymentIntentSucceeded(paymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    return null;
  }

  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await getOrderOrFail(orderId, { transaction });

    return orderRepository.updateOrder(
      existingOrder,
      {
        status: "confirmed",
        paymentStatus: "paid",
        stripePaymentIntentId: paymentIntent.id,
      },
      { transaction }
    );
  });

  return orderResponse(order);
}

export async function markStripePaymentIntentFailed(paymentIntent) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    return null;
  }

  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await getOrderOrFail(orderId, { transaction });

    return orderRepository.updateOrder(
      existingOrder,
      {
        paymentStatus: "failed",
        stripePaymentIntentId: paymentIntent.id,
      },
      { transaction }
    );
  });

  return orderResponse(order);
}

export async function checkStripeCheckoutPayment(userId, sessionId) {
  if (!sessionId) {
    throw new AppError("Checkout session id is required", 400);
  }

  const session = await retrieveCheckoutSession(sessionId);
  const order = await syncStripeCheckoutSession(session);

  if (!order || order.userId !== userId) {
    throw new AppError("Checkout session not found", 404);
  }

  return {
    order,
    paymentStatus: order.paymentStatus,
    stripePaymentStatus: session.payment_status,
    checkoutSessionStatus: session.status,
  };
}

export async function getCurrentCheckout(userId) {
  const cart = await getCartWithItems(userId);

  return cartResponse(cart);
}

export async function previewOrder(userId, data) {
  const cart = await getCartWithItems(userId);
  await resolveShippingAddress(userId, data, { createAddress: false });
  assertItemsCanCheckout(cart.items);

  return {
    ...calculateTotals(cart.items),
    currency: data.currency,
    items: cartResponse(cart).items,
  };
}

export async function checkout(user, data) {
  const userId = user.id;
  const checkoutResult = await sequelize.transaction(async (transaction) => {
    const cart = await getCartWithItems(userId, { transaction });
    assertItemsCanCheckout(cart.items);

    const { addressId } = await resolveShippingAddress(
      userId,
      data,
      { transaction }
    );
    const totals = calculateTotals(cart.items);

    const order = await orderRepository.createOrder(
      {
        orderNumber: makeOrderNumber(),
        userId,
        addressId,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: data.paymentMethod,
        paymentProvider: data.paymentMethod,
        currency: data.currency,
        ...totals,
      },
      { transaction }
    );

    const orderItems = cartItemsToOrderItems(order.id, cart.items);

    await orderRepository.createOrderItems(orderItems, { transaction });

    let stripeSession = null;

    if (data.paymentMethod === "stripe") {
      stripeSession = await createEmbeddedCheckoutSession({
        order: {
          ...order.get({ plain: true }),
          items: orderItems,
        },
        user,
      });

      await orderRepository.updateOrder(
        order,
        {
          stripeCheckoutSessionId: stripeSession.id,
          stripePaymentIntentId:
            getPaymentIntentId(stripeSession.payment_intent),
        },
        { transaction }
      );
    }

    for (const item of cart.items) {
      await Product.decrement(
        { stock: item.quantity },
        {
          where: { id: item.productId },
          transaction,
        }
      );
    }

    await CartItem.destroy({
      where: { cartId: cart.id },
      transaction,
    });

    return {
      orderId: order.id,
      stripeCheckoutSessionId: stripeSession?.id ?? null,
      stripeClientSecret: stripeSession?.client_secret ?? null,
    };  
  });

  const order = await orderRepository.findOrderByIdForUser(userId, checkoutResult.orderId);
  const response = orderResponse(order);

  if (checkoutResult.stripeClientSecret) {
    return {
      ...response,
      clientSecret: checkoutResult.stripeClientSecret,
      stripeClientSecret: checkoutResult.stripeClientSecret,
      stripeCheckoutSessionId: checkoutResult.stripeCheckoutSessionId,
    };
  }

  return response;
}

export async function getOrders(userId) {
  const orders = await orderRepository.findOrdersByUserId(userId);

  return orders.map(orderResponse);
}

export async function getOrderById(userId, orderId) {
  const order = await getOrderForUserOrFail(userId, orderId);

  return orderResponse(order);
}

export async function cancelOrder(userId, orderId) {
  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await getOrderForUserOrFail(userId, orderId, {
      transaction,
    });

    if (existingOrder.status !== "pending" || existingOrder.paymentStatus !== "pending") {
      throw new AppError("Only pending unpaid orders can be cancelled", 400);
    }

    return orderRepository.updateOrder(
      existingOrder,
      {
        status: "cancelled",
        paymentStatus: "cancelled",
      },
      { transaction }
    );
  });

  return orderResponse(order);
}

export async function retryPayment(userId, orderId) {
  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await getOrderForUserOrFail(userId, orderId, {
      transaction,
    });

    if (existingOrder.paymentProvider !== "stripe") {
      throw new AppError("Only Stripe orders can retry payment", 400);
    }

    if (!["failed", "cancelled"].includes(existingOrder.paymentStatus)) {
      throw new AppError("Payment can only be retried after failure or cancellation", 400);
    }

    return orderRepository.updateOrder(
      existingOrder,
      {
        paymentStatus: "pending",
      },
      { transaction }
    );
  });

  return orderResponse(order);
}

export async function getAdminOrders(query = {}) {
  const orders = await orderRepository.findAllOrders(query);

  return orders.map(orderResponse);
}

export async function getAdminOrderById(orderId) {
  const order = await getOrderOrFail(orderId);

  return orderResponse(order);
}

export async function updateAdminOrder(orderId, data) {
  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await getOrderOrFail(orderId, { transaction });

    return orderRepository.updateOrder(
      existingOrder,
      {
        ...(data.status && { status: data.status }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
      },
      { transaction }
    );
  });

  return orderResponse(order);
}

export async function updateOrderStatus(orderId, status) {
  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await getOrderOrFail(orderId, { transaction });

    return orderRepository.updateOrder(existingOrder, { status }, { transaction });
  });

  return orderResponse(order);
}

export async function updatePaymentStatus(orderId, paymentStatus) {
  const order = await sequelize.transaction(async (transaction) => {
    const existingOrder = await getOrderOrFail(orderId, { transaction });

    return orderRepository.updateOrder(
      existingOrder,
      { paymentStatus },
      { transaction }
    );
  });

  return orderResponse(order);
}
