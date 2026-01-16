import express from 'express';
import * as EventController from './event.controller';
import { validate } from '@/middleware/validate.middleware';
import { createEventSchema, updateEventSchema } from './event.validator';
import { auth } from '@/middleware/auth.middleware';
import { UserRole } from '@/modules/user/user.types';
import { upload } from '@/middleware/upload.middleware';

const router = express.Router();

router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);

router.post(
  '/',
  auth(UserRole.ADMIN),
  upload.array('images', 10),
  validate(createEventSchema),
  EventController.createEvent
);

router.put(
  '/:id',
  auth(UserRole.ADMIN),
  upload.array('images', 10),
  validate(updateEventSchema),
  EventController.updateEvent
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN),
  EventController.deleteEvent
);

export const EventRoutes = router;
