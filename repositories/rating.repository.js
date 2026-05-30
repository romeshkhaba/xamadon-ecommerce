import sequelize from "../config/database.js";
import { Product, Rating, User } from "../models/associations.js";

const userAttributes = ["id", "name", "email"];
const productAttributes = ["id", "name", "image"];

export async function findRatingsByProductId(productId) {
  return Rating.findAll({
    where: { productId },
    include: [
      {
        model: User,
        as: "user",
        attributes: userAttributes,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

export async function findRatingsByUserId(userId) {
  return Rating.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        as: "product",
        attributes: productAttributes,
      },
    ],
    order: [["createdAt", "DESC"]],
  });
}

export async function findRatingByIdForUser(userId, ratingId) {
  return Rating.findOne({
    where: {
      id: ratingId,
      userId,
    },
  });
}

export async function findRatingByUserAndProduct(userId, productId) {
  return Rating.findOne({
    where: {
      userId,
      productId,
    },
  });
}

export async function findAllRatings() {
  return Rating.findAll({
    include: [
      { model: User, as: 'user', attributes: userAttributes },
      { model: Product, as: 'product', attributes: productAttributes },
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function findRatingById(ratingId) {
  return Rating.findByPk(ratingId, {
    include: [
      { model: User, as: 'user', attributes: userAttributes },
      { model: Product, as: 'product', attributes: productAttributes },
    ],
  });
}

export async function createRating(data) {
  return Rating.create(data);
}

export async function updateRating(rating, data) {
  await rating.update(data);

  return rating;
}

export async function deleteRating(rating) {
  return rating.destroy();
}

export async function getRatingSummaryByProductId(productId) {
  const summary = await Rating.findOne({
    attributes: [
      "productId",
      [sequelize.fn("AVG", sequelize.col("score")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "ratingCount"],
    ],
    where: { productId },
    group: ["productId"],
    raw: true,
  });

  return summary ?? { productId, averageRating: 0, ratingCount: 0 };
}

export async function getRatingSummariesByProductIds(productIds = []) {
  if (!productIds.length) {
    return new Map();
  }

  const summaries = await Rating.findAll({
    attributes: [
      "productId",
      [sequelize.fn("AVG", sequelize.col("score")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "ratingCount"],
    ],
    where: {
      productId: productIds,
    },
    group: ["productId"],
    raw: true,
  });

  return new Map(
    summaries.map((summary) => [
      summary.productId,
      {
        productId: summary.productId,
        averageRating: Number(summary.averageRating ?? 0),
        ratingCount: Number(summary.ratingCount ?? 0),
      },
    ])
  );
}
