import { Op } from 'sequelize';
import { AppError } from '../middleware/error-response.js';
import Product from '../models/product.model.js';

export async function createProduct(data) {
  return Product.create(data);
}

export async function updateProduct(id, data) {
  const existingProduct = await Product.findOne({
    where: { id },
  });

  if (!existingProduct) {
    return null;
  }

  await existingProduct.update(data);

  return existingProduct;
}

export async function deleteProduct(id) {
  const existingProduct = await Product.findOne({
    where: { id },
  });

  if (!existingProduct) {
    return null;
  }

  await existingProduct.update({ isActive: false });

  return existingProduct;
}

export async function getProductById(id) {
  const product = await Product.findOne({
    where: { id },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

export async function getProductByID(id) {
  return getProductById(id);
}

export async function getProducts({
  category,
  search,
  page = 1,
  limit = 12,
  isActive = true,
  isHero,
} = {}) {
  const where = {};

  if (category) {
    where.category = category;
  }

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (typeof isHero === 'boolean') {
    where.isHero = isHero;
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  return Product.findAndCountAll({
    where,
    limit,
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']],
  });
}

export async function getProductsByCategory(category) {
  return Product.findAll({
    where: {
      category,
      isActive: true,
    },
    order: [['createdAt', 'DESC']],
  });
}

export async function getDistinctCategories() {
  const rows = await Product.findAll({
    attributes: ['category'],
    group: ['category'],
    raw: true,
    order: [['category', 'ASC']],
  });

  const distinctCategories = rows
    .map((row) => row.category)
    .filter(Boolean);

  if (distinctCategories.length > 0) {
    return distinctCategories;
  }

  return Product.rawAttributes.category.values ?? [];
}
