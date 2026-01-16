import express from 'express';
import { AuthRoutes } from '@/modules/auth/auth.routes';
import { ContentRoutes } from '@/modules/content/content.routes';
import { EventRoutes } from '@/modules/event/event.routes';
import { SocietyRoutes } from '@/modules/society/society.routes';
import { SportsRoutes } from '@/modules/sports/sports.routes';
import { AcademicRoutes } from '@/modules/academic/academic.routes';

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
  {
    path: '/society',
    route: SocietyRoutes,
  },
  {
    path: '/sports',
    route: SportsRoutes,
  },
  {
    path: '/academic',
    route: AcademicRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
