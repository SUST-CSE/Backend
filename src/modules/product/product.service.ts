import { Product } from './product.schema';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { NotFoundError } from '../../utils/errors';

// Get all active products (public)
export const getAllProducts = async () => {
  return await Product.find({ isActive: true, isDeleted: false })
    .sort({ order: 1, createdAt: -1 })
    .select('-isDeleted -createdBy')
    .lean();
};

// Get all products for admin (including inactive)
export const getAllProductsAdmin = async () => {
  return await Product.find({ isDeleted: false })
    .sort({ order: 1, createdAt: -1 })
    .populate('createdBy', 'name email')
    .lean();
};

// Create product
export const createProduct = async (data: any, file: Express.Multer.File | undefined, userId: string) => {
  let icon = '';
  if (file) {
    const { secure_url } = await uploadToCloudinary(file, 'sust-cse/products');
    icon = secure_url;
  }

  return await Product.create({
    ...data,
    icon,
    createdBy: userId,
  });
};

// Update product
export const updateProduct = async (id: string, data: any, file: Express.Multer.File | undefined) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) throw new NotFoundError('Product not found');

  if (file) {
    const { secure_url } = await uploadToCloudinary(file, 'sust-cse/products');
    data.icon = secure_url;
  }

  Object.assign(product, data);
  return await product.save();
};

// Delete product (soft delete)
export const deleteProduct = async (id: string) => {
  const product = await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!product) throw new NotFoundError('Product not found');
  return product;
};

// Toggle product active status
export const toggleProductStatus = async (id: string) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) throw new NotFoundError('Product not found');
  
  product.isActive = !product.isActive;
  return await product.save();
};

// Reorder products
export const reorderProducts = async (productIds: string[]) => {
  const updates = productIds.map((id, index) => 
    Product.findByIdAndUpdate(id, { order: index })
  );
  
  await Promise.all(updates);
  return { message: 'Products reordered successfully' };
};
