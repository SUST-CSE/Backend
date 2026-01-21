import { Request, Response } from 'express';
import * as BlogService from './blog.service';
import { asyncHandler } from '@/utils/asyncHandler.util';
import { successResponse } from '@/utils/response.util';
import { uploadToCloudinary } from '@/utils/cloudinary.util';
import { AppError } from '@/utils/errors';

  // Upload image to Cloudinary if provided
  if (req.file) {
    const { secure_url } = await uploadToCloudinary(req.file, 'sust-cse/blogs');
    imageUrl = secure_url;
  }

  // Parse tags if they come as a string from FormData
  let tags = req.body.tags || [];
  if (typeof tags === 'string') {
    tags = tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
  }

  // Check if user is authenticated
  const user = (req as any).user;
  
  const blogData: any = {
    ...req.body,
    tags,
    image: imageUrl || undefined,
  };

  if (user) {
    // Authenticated user
    blogData.author = user._id;
  } else {
    // Guest user - require name and email
    if (!req.body.guestName || !req.body.guestEmail) {
      throw new AppError('Guest users must provide name and email', 400);
    }
    blogData.guestName = req.body.guestName;
    blogData.guestEmail = req.body.guestEmail;
  }

  const blog = await BlogService.createBlog(blogData);
  successResponse(res, blog, 'Blog post submitted for verification', 201);
});

export const getPublishedBlogs = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await BlogService.getPublishedBlogs();
  successResponse(res, blogs, 'Published blogs fetched successfully');
});

export const getPendingBlogs = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await BlogService.getPendingBlogs();
  successResponse(res, blogs, 'Pending blogs fetched successfully');
});

export const getMyBlogs = asyncHandler(async (req: Request, res: Response) => {
  const blogs = await BlogService.getMyBlogs((req as any).user._id);
  successResponse(res, blogs, 'Your blogs fetched successfully');
});

export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.getBlogById(req.params.id as string);
  successResponse(res, blog, 'Blog post fetched successfully');
});

export const verifyBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.verifyBlog(req.params.id as string, req.body.status);
  successResponse(res, blog, `Blog post ${req.body.status.toLowerCase()} successfully`);
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await BlogService.deleteBlog(req.params.id as string, user._id, user.role);
  successResponse(res, null, 'Blog post deleted successfully');
});
