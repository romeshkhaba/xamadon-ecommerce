import path from 'path';
import { put } from '@vercel/blob';
import * as productService from '../services/product.service.js';
import { AppError } from '../middleware/error-response.js';

function createBlobPath(originalName) {
  const extension = path.extname(originalName).toLowerCase();
  const basename = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  return `products/${basename || 'product'}-${uniqueSuffix}${extension}`;
}

export async function getProducts(req, res) {
  const products = await productService.getProducts(req.query);

  res.success(products, 'Products retrieved successfully');
}

export async function getAdminProducts(req, res) {
  const products = await productService.getAdminProducts(req.query);

  res.success(products, 'Admin products retrieved successfully');
}

export async function createProduct(req, res) {
  const product = await productService.createProduct(req.validatedData);

  res.success(product, 'Product created successfully', 201);
}

export async function updateProduct(req, res) {
  const product = await productService.updateProduct(
    req.params.id,
    req.validatedData
  );

  res.success(product, 'Product updated successfully');
}

export async function deleteProduct(req, res) {
  const product = await productService.deleteProduct(req.params.id);

  res.success(product, 'Product deleted successfully');
}

export async function uploadProductImage(req, res) {
  if (!req.file) {
    throw new AppError('Image file is required', 400);
  }

  const blob = await put(createBlobPath(req.file.originalname), req.file.buffer, {
    access: 'public',
    contentType: req.file.mimetype,
  });

  res.success({ image: blob.url }, 'Product image uploaded successfully', 201);
}

export async function getProductById(req, res) {
  const product = await productService.getProductById(req.params.id);

  res.success(product, 'Product retrieved successfully');
}

export async function getCategories(req, res) {
  const categories = await productService.getCategories();

  res.success(categories, 'Categories retrieved successfully');
}

export async function getProductsByCategory(req, res){
  const category = req.params.category;
  const products = await productService.getProductsByCategory(category);

  res.success(products, 'Get all products by category');
}
