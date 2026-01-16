import { Types } from 'mongoose';
import { EventCategory, EventStatus } from './event.types';

export interface IEvent {
  _id: Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  location: string;
  organizer: string;
  category: EventCategory;
  registrationLink?: string;
  maxParticipants?: number;
  participants: Types.ObjectId[];
  isFeatured: boolean;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
