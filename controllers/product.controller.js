import * as productService from '../services/product.service.js';

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
