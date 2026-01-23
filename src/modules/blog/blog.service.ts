import { Blog } from './blog.schema';
import { IBlog, BlogStatus } from './blog.interface';
import { AppError } from '@/utils/errors';

export const createBlog = async (data: Partial<IBlog>): Promise<IBlog> => {
  return Blog.create(data);
};

export const getPublishedBlogs = async (): Promise<IBlog[]> => {
  return Blog.find({ status: BlogStatus.PUBLISHED }).populate('author', 'name profileImage');
};

export const getPendingBlogs = async (): Promise<IBlog[]> => {
  return Blog.find({ status: BlogStatus.PENDING }).populate('author', 'name profileImage');
};

export const getMyBlogs = async (userId: string): Promise<IBlog[]> => {
  return Blog.find({ author: userId }).sort({ createdAt: -1 });
};

export const getBlogById = async (id: string): Promise<IBlog | null> => {
  const blog = await Blog.findById(id).populate('author', 'name profileImage');
  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }
  return blog;
};

export const verifyBlog = async (id: string, status: BlogStatus): Promise<IBlog | null> => {
  const blog = await Blog.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }
  return blog;
};

export const deleteBlog = async (id: string, userId: string, role: string): Promise<void> => {
  const blog = await Blog.findById(id);
  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }

  // Only author or admin can delete
  if (blog.author?.toString() !== userId && role !== 'ADMIN') {
    throw new AppError('You are not authorized to delete this blog', 403);
  }

  blog.isDeleted = true;
  await blog.save();
};
