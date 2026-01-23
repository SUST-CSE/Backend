import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as SportsService from './sports.service';

// Tournaments
export const createTournament = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await SportsService.createTournament(req.body, (req.files as Express.Multer.File[]) || [], userId);
  successResponse(res, result, 'Tournament created successfully', 201);
});

export const getTournaments = asyncHandler(async (req: Request, res: Response) => {
  const result = await SportsService.getAllTournaments(req.query);
  successResponse(res, result, 'Tournaments fetched successfully');
});

export const getTournamentById = asyncHandler(async (req: Request, res: Response) => {
  const result = await SportsService.getTournamentById(req.params.id as string);
  successResponse(res, result, 'Tournament details fetched successfully');
});

export const updateTournament = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await SportsService.updateTournament(req.params.id as string, req.body, (req.files as Express.Multer.File[]), userId);
  successResponse(res, result, 'Tournament updated successfully');
});

export const deleteTournament = asyncHandler(async (req: Request, res: Response) => {
  await SportsService.deleteTournament(req.params.id as string);
  successResponse(res, null, 'Tournament deleted successfully');
});

// Player Showcase
export const createPlayerShowcase = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await SportsService.createPlayerShowcase(req.body, req.file as Express.Multer.File, userId);
  successResponse(res, result, 'Player showcase created successfully', 201);
});

export const getPlayerShowcases = asyncHandler(async (req: Request, res: Response) => {
  const result = await SportsService.getAllPlayerShowcases(req.query);
  successResponse(res, result, 'Player showcases fetched successfully');
});

export const updatePlayerShowcase = asyncHandler(async (req: Request, res: Response) => {
  const result = await SportsService.updatePlayerShowcase(req.params.id as string, req.body, req.file as Express.Multer.File);
  successResponse(res, result, 'Player showcase updated successfully');
});

export const deletePlayerShowcase = asyncHandler(async (req: Request, res: Response) => {
  await SportsService.deletePlayerShowcase(req.params.id as string);
  successResponse(res, null, 'Player showcase removed successfully');
});
