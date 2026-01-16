import { Event } from './event.schema';
import { uploadToCloudinary } from '@/utils/cloudinary.util';
import { NotFoundError } from '@/utils/errors';
import { EventStatus } from './event.types';

export const createEvent = async (data: any, files: Express.Multer.File[], userId: string) => {
  const images = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const { url } = await uploadToCloudinary(file, 'sust-cse/events');
      images.push(url);
    }
  }

  return await Event.create({
    ...data,
    images,
    createdBy: userId,
  });
};

export const getAllEvents = async (query: any) => {
  const { status, category, isFeatured, searchTerm } = query;
  const filter: any = { isDeleted: false };

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { location: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  return await Event.find(filter)
    .sort({ startDate: 1 })
    .populate('createdBy', 'name email');
};

export const getEventById = async (id: string) => {
  const event = await Event.findById(id).populate('createdBy', 'name email');
  if (!event) throw new NotFoundError('Event not found');
  return event;
};

export const updateEvent = async (id: string, data: any, files: Express.Multer.File[] | undefined, userId: string) => {
  const event = await Event.findById(id);
  if (!event) throw new NotFoundError('Event not found');

  const updateData = { ...data };

  if (files && files.length > 0) {
    const images = [];
    for (const file of files) {
      const { url } = await uploadToCloudinary(file, 'sust-cse/events');
      images.push(url);
    }
    updateData.images = [...(event.images || []), ...images];
  }

  return await Event.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteEvent = async (id: string) => {
  const event = await Event.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!event) throw new NotFoundError('Event not found');
  return event;
};
