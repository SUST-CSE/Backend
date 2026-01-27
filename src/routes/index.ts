import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { ContentRoutes } from '../modules/content/content.routes';
import { EventRoutes } from '../modules/event/event.routes';
import { SocietyRoutes } from '../modules/society/society.routes';
import { SportsRoutes } from '../modules/sports/sports.routes';
import { AcademicRoutes } from '../modules/academic/academic.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { BlogRoutes } from '../modules/blog/blog.routes';
import { AlumniRoutes } from '../modules/alumni/alumni.routes';
import { ProductRoutes } from '../modules/product/product.routes';
import { WorkAssignmentRoutes } from '../modules/work-assignment/work-assignment.routes';
import { ApplicationRoutes } from '../modules/application/application.routes';
import { EmailLogRoutes } from '../modules/email-log/email-log.routes';
import { FinanceRoutes } from '../modules/finance/finance.routes';

const router = express.Router();
console.log('✅ Main Router Module Loaded');

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
  {
    path: '/payment',
    route: PaymentRoutes,
  },
  {
    path: '/blogs',
    route: BlogRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/alumni',
    route: AlumniRoutes,
  },
  {
    path: '/',
    route: ProductRoutes,
  },
  {
    path: '/work-assignments',
    route: WorkAssignmentRoutes,
  },
  {
    path: '/applications',
    route: ApplicationRoutes,
  },
  {
    path: '/email-logs',
    route: EmailLogRoutes,
  },
  {
    path: '/finance',
    route: FinanceRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
