import { Event } from './event.schema';
import { uploadToCloudinary } from '@/utils/cloudinary.util';
import { NotFoundError } from '@/utils/errors';
import { EventStatus } from './event.types';

export const createEvent = async (data: any, files: { [fieldname: string]: Express.Multer.File[] } | undefined, userId: string) => {
  const images = [];
  const attachments = [];

  if (files) {
    if (files['images']) {
      for (const file of files['images']) {
        const { url } = await uploadToCloudinary(file, 'sust-cse/events/images');
        images.push(url);
      }
    }
    if (files['attachments']) {
      for (const file of files['attachments']) {
        const { url } = await uploadToCloudinary(file, 'sust-cse/events/attachments');
        attachments.push(url);
      }
    }
  }

  return await Event.create({
    ...data,
    images,
    attachments,
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

export const updateEvent = async (id: string, data: any, files: { [fieldname: string]: Express.Multer.File[] } | undefined, userId: string) => {
  const event = await Event.findById(id);
  if (!event) throw new NotFoundError('Event not found');

  const updateData = { ...data };

  if (files) {
    if (files['images']) {
      const images = [];
      for (const file of files['images']) {
        const { url } = await uploadToCloudinary(file, 'sust-cse/events/images');
        images.push(url);
      }
      updateData.images = [...(event.images || []), ...images];
    }
    if (files['attachments']) {
      const attachments = [];
      for (const file of files['attachments']) {
        const { url } = await uploadToCloudinary(file, 'sust-cse/events/attachments');
        attachments.push(url);
      }
      updateData.attachments = [...(event.attachments || []), ...attachments];
    }
  }

  return await Event.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteEvent = async (id: string) => {
  const event = await Event.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!event) throw new NotFoundError('Event not found');
  return event;
};
