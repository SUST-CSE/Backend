import express from 'express';
import * as BlogController from './blog.controller';
import { validate } from '../../middleware/validate.middleware';
import { createBlogSchema, updateBlogStatusSchema } from './blog.validator';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../modules/user/user.types';
import { upload } from '../../middleware/upload.middleware';

const router = express.Router();

router.get('/', BlogController.getPublishedBlogs);
router.get('/pending', auth(UserRole.ADMIN), BlogController.getPendingBlogs);
router.get('/mine', auth(), BlogController.getMyBlogs);
router.get('/:id', BlogController.getBlogById);

router.post(
  '/',
  auth(),
  upload.single('image'),
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
