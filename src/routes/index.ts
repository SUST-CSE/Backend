import express from 'express';
import { AuthRoutes } from '@/modules/auth/auth.routes';
import { ContentRoutes } from '@/modules/content/content.routes';
import { EventRoutes } from '@/modules/event/event.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/content',
    route: ContentRoutes,
  },
  {
    path: '/events',
    route: EventRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
