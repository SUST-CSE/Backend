import express from 'express';
import * as BlogController from './blog.controller';
import { validate } from '@/middleware/validate.middleware';
import { createBlogSchema, updateBlogStatusSchema } from './blog.validator';
import { auth } from '@/middleware/auth.middleware';
import { UserRole } from '@/modules/user/user.types';

const router = express.Router();

router.get('/', BlogController.getPublishedBlogs);
router.get('/pending', auth(UserRole.ADMIN), BlogController.getPendingBlogs);
router.get('/:id', BlogController.getBlogById);

router.post(
  '/',
  auth(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN),
  validate(createBlogSchema),
  BlogController.createBlog
);

router.patch(
  '/:id/verify',
  auth(UserRole.ADMIN),
  validate(updateBlogStatusSchema),
  BlogController.verifyBlog
);

router.delete('/:id', auth(), BlogController.deleteBlog);

export const BlogRoutes = router;
