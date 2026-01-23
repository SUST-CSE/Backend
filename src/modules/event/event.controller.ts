import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import * as EventService from './event.service';

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const result = await EventService.createEvent(req.body, files, userId);
  successResponse(res, result, 'Event created successfully', 201);
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const result = await EventService.getAllEvents(req.query);
  successResponse(res, result, 'Events fetched successfully');
});

export const getUpcomingEvents = asyncHandler(async (req: Request, res: Response) => {
  const result = await EventService.getAllEvents({ status: 'UPCOMING' });
  successResponse(res, result, 'Upcoming events fetched successfully');
});

export const getOngoingEvents = asyncHandler(async (req: Request, res: Response) => {
  const result = await EventService.getAllEvents({ status: 'ONGOING' });
  successResponse(res, result, 'Ongoing events fetched successfully');
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const result = await EventService.getEventById(req.params.id as string);
  successResponse(res, result, 'Event details fetched successfully');
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const result = await EventService.updateEvent(req.params.id as string, req.body, files, userId);
  successResponse(res, result, 'Event updated successfully');
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await EventService.deleteEvent(req.params.id as string);
  successResponse(res, null, 'Event deleted successfully');
});
