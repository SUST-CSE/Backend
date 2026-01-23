import express from 'express';
import * as ProductController from './product.controller';
import { validate } from '../../middleware/validate.middleware';
import { createProductSchema, updateProductSchema, reorderProductsSchema } from './product.validator';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../modules/user/user.types';
import { upload } from '../../middleware/upload.middleware';

const router = express.Router();

// Public routes
router.get('/products', ProductController.getProducts);

// Admin routes
router.get(
  '/products/admin',
  auth(UserRole.ADMIN),
  ProductController.getProductsAdmin
);

router.post(
  '/products',
  auth(UserRole.ADMIN),
  upload.single('icon'),
  validate(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/products/:id',
  auth(UserRole.ADMIN),
  upload.single('icon'),
  validate(updateProductSchema),
  ProductController.updateProduct
);

router.delete(
  '/products/:id',
  auth(UserRole.ADMIN),
  ProductController.deleteProduct
);

router.patch(
  '/products/:id/toggle',
  auth(UserRole.ADMIN),
  ProductController.toggleProductStatus
);

router.patch(
  '/products/reorder',
  auth(UserRole.ADMIN),
  validate(reorderProductsSchema),
  ProductController.reorderProducts
);

export const ProductRoutes = router;
