import { Op } from "sequelize";
import { Address, Order, OrderItem, User } from "../models/associations.js";

const orderInclude = [
  {
    model: OrderItem,
    as: "items",
  },
  {
    model: User,
    attributes:['id', 'email','name','createdAt','updatedAt'],
    as: "user",
  },
  {
    model: Address,
    as: "address",
  },
];

export async function findOrdersByUserId(userId, options = {}) {
  return Order.findAll({
    where: { userId },
    include: orderInclude,
    order: [
      ["createdAt", "DESC"],
      [{ model: OrderItem, as: "items" }, "createdAt", "ASC"],
    ],
    transaction: options.transaction,
  });
}

export async function findOrderByIdForUser(userId, orderId, options = {}) {
  return Order.findOne({
    where: {
      id: orderId,
      userId,
    },
    include: orderInclude,
    transaction: options.transaction,
  });
}

export async function findOrderById(orderId, options = {}) {
  return Order.findOne({
    where: { id: orderId },
    include: orderInclude,
    transaction: options.transaction,
  });
}

export async function findOrderByStripeCheckoutSessionId(sessionId, options = {}) {
  return Order.findOne({
    where: { stripeCheckoutSessionId: sessionId },
    include: orderInclude,
    transaction: options.transaction,
  });
}

export async function findAllOrders({ status, paymentStatus } = {}, options = {}) {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  return Order.findAll({
    where,
    include: orderInclude,
    order: [
      ["createdAt", "DESC"],
      [{ model: OrderItem, as: "items" }, "createdAt", "ASC"],
    ],
    transaction: options.transaction,
  });
}

export async function createOrder(data, options = {}) {
  return Order.create(data, {
    transaction: options.transaction,
  });
}

export async function hasDeliveredOrderWithProduct(userId, productId) {
  const order = await Order.findOne({
    where: { userId, status: 'delivered' },
    include: [
      {
        model: OrderItem,
        as: 'items',
        where: { productId },
        required: true,
        attributes: [],
      },
    ],
    attributes: ['id'],
  });

  return Boolean(order);
}

export async function createOrderItems(items, options = {}) {
  return OrderItem.bulkCreate(items, {
    transaction: options.transaction,
  });
}

export async function updateOrder(order, data, options = {}) {
  await order.update(data, {
    transaction: options.transaction,
  });

  return order;
}
