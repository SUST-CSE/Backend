import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as ProductService from './product.service';

// Get all active products (public)
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProducts();
  successResponse(res, result, 'Products fetched successfully');
});

// Get all products for admin
export const getProductsAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProductService.getAllProductsAdmin();
  successResponse(res, result, 'Products fetched successfully');
});

// Create product
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await ProductService.createProduct(req.body, req.file, userId);
  successResponse(res, result, 'Product created successfully', 201);
});

// Update product
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProductService.updateProduct(req.params.id as string, req.body, req.file);
  successResponse(res, result, 'Product updated successfully');
});

// Delete product
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await ProductService.deleteProduct(req.params.id as string);
  successResponse(res, null, 'Product deleted successfully');
});

// Toggle product status
export const toggleProductStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProductService.toggleProductStatus(req.params.id as string);
  successResponse(res, result, 'Product status toggled successfully');
});

// Reorder products
export const reorderProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await ProductService.reorderProducts(req.body.productIds);
  successResponse(res, result, 'Products reordered successfully');
});
