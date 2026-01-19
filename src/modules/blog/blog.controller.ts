import { Request, Response } from 'express';
import * as BlogService from './blog.service';
import { asyncHandler } from '@/utils/asyncHandler.util';
import { successResponse } from '@/utils/response.util';

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.createBlog({
    ...req.body,
    author: (req as any).user._id,
  });
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

export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.getBlogById(req.params.id);
  successResponse(res, blog, 'Blog post fetched successfully');
});

export const verifyBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.verifyBlog(req.params.id, req.body.status);
  successResponse(res, blog, `Blog post ${req.body.status.toLowerCase()} successfully`);
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await BlogService.deleteBlog(req.params.id, user._id, user.role);
  successResponse(res, null, 'Blog post deleted successfully');
});
