import { z } from 'zod';
import { SportType } from './sports.types';

export const createTournamentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sportType: z.nativeEnum(SportType),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  venue: z.string().min(1, 'Venue is required'),
  description: z.string().min(1, 'Description is required'),
  winner: z.string().optional(),
  runnerUp: z.string().optional(),
  bestPlayer: z.string().optional(),
});

export const updateTournamentSchema = createTournamentSchema.partial();

export const createPlayerShowcaseSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  sportType: z.nativeEnum(SportType),
  achievements: z.array(z.string()).min(1, 'At least one achievement is required'),
  totalMatches: z.number().int().nonnegative().optional(),
  stats: z.record(z.string(), z.any()).optional(),
  isFeatured: z.boolean().optional(),
});

export const updatePlayerShowcaseSchema = createPlayerShowcaseSchema.partial();
