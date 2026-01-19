import { z } from 'zod';
import { BlogStatus } from './blog.interface';

export const createBlogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  content: z.string().min(20, 'Content must be at least 20 characters long'),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()).optional(),
});

export const updateBlogStatusSchema = z.object({
  status: z.enum([BlogStatus.PUBLISHED, BlogStatus.REJECTED]),
});
