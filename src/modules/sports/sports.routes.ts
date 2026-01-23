import express from 'express';
import * as SportsController from './sports.controller';
import { validate } from '../../middleware/validate.middleware';
import { createTournamentSchema, updateTournamentSchema, createPlayerShowcaseSchema, updatePlayerShowcaseSchema } from './sports.validator';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../modules/user/user.types';
import { upload } from '../../middleware/upload.middleware';

const router = express.Router();

// Tournaments
router.get('/tournaments', SportsController.getTournaments);
router.get('/tournaments/:id', SportsController.getTournamentById);

router.post(
  '/tournaments',
  auth(UserRole.ADMIN),
  upload.array('images', 10),
  validate(createTournamentSchema),
  SportsController.createTournament
);

router.put(
  '/tournaments/:id',
  auth(UserRole.ADMIN),
  upload.array('images', 10),
  validate(updateTournamentSchema),
  SportsController.updateTournament
);

router.delete(
  '/tournaments/:id',
  auth(UserRole.ADMIN),
  SportsController.deleteTournament
);

// Player Showcase
router.get('/players', SportsController.getPlayerShowcases);

router.post(
  '/players',
  auth(UserRole.ADMIN),
  upload.single('image'),
  validate(createPlayerShowcaseSchema),
  SportsController.createPlayerShowcase
);

router.patch(
  '/players/:id',
  auth(UserRole.ADMIN),
  upload.single('image'),
  validate(updatePlayerShowcaseSchema),
  SportsController.updatePlayerShowcase
);

router.delete(
  '/players/:id',
  auth(UserRole.ADMIN),
  SportsController.deletePlayerShowcase
);

export const SportsRoutes = router;
