import Cart from "./cart.model.js";
import Product from "./product.model.js";
import CartItem from "./cart-item.model.js";
import OrderItem from './order-item.model.js';
import User from "./user.model.js";
import Address from "./address.model.js";
import Order from "./order.model.js";
import Permission from "./permission.model.js";
import Rating from "./rating.model.js";
import RoleModule from "./role-module.model.js";
import Role from "./role.model.js";
import Wishlist from "./wishlist.model.js";

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
});

User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

Role.hasMany(RoleModule, {
  foreignKey: "roleId",
  as: "roleModules",
  onDelete: "CASCADE",
});

RoleModule.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

Permission.hasMany(RoleModule, {
  foreignKey: "permissionId",
  as: "roleModules",
});

RoleModule.belongsTo(Permission, {
  foreignKey: "permissionId",
  as: "permission",
});

User.hasOne(Cart, {
  foreignKey: "userId",
  as: "cart",
});

Cart.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Cart.belongsToMany(Product, {
  through: CartItem,
  foreignKey: "cartId",
  otherKey: "productId",
  as: "products",
});

Product.belongsToMany(Cart, {
  through: CartItem,
  foreignKey: "productId",
  otherKey: "cartId",
  as: "carts",
});

Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cartId",
  as: "cart",
});

Product.hasMany(CartItem, {
  foreignKey: "productId",
  as: "cartItems",
});

CartItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

User.hasMany(Address, {
  foreignKey: "userId",
  as: "addresses",
  onDelete: "CASCADE",
});

Address.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Order, {
  foreignKey: "userId",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Address.hasMany(Order, {
  foreignKey: "addressId",
  as: "orders",
});

Order.belongsTo(Address, {
  foreignKey: "addressId",
  as: "address",
});

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

User.hasMany(Rating, {
  foreignKey: "userId",
  as: "ratings",
  onDelete: "CASCADE",
});

Rating.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Product.hasMany(Rating, {
  foreignKey: "productId",
  as: "ratings",
  onDelete: "CASCADE",
});

Rating.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

User.hasMany(Wishlist, {
  foreignKey: "userId",
  as: "wishlistItems",
  onDelete: "CASCADE",
});

Wishlist.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Product.hasMany(Wishlist, {
  foreignKey: "productId",
  as: "wishlistItems",
  onDelete: "CASCADE",
});

Wishlist.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

export {
  Address,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Permission,
  Product,
  Rating,
  Role,
  RoleModule,
  User,
  Wishlist,
};
