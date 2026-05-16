import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Order = sequelize.define("order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  addressId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "addresses",
      key: "id",
    },
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "processing", "shipped", "delivered", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  },
  paymentStatus: {
    type: DataTypes.ENUM("pending", "paid", "failed", "refunded", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  },
  paymentMethod: {
    type: DataTypes.ENUM("cod", "stripe"),
    allowNull: false,
    defaultValue: "cod",
  },
  paymentProvider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "cod",
  },
  stripeCheckoutSessionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: "usd",
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  placedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

export default Order;
