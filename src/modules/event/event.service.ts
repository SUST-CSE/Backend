import { Event } from './event.schema';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { NotFoundError } from '../../utils/errors';
import { EventStatus } from './event.types';
import { notifyInterestedUsers } from '../../utils/notification.util';

export const createEvent = async (data: any, files: { [fieldname: string]: Express.Multer.File[] } | undefined, userId: string) => {
  const images = [];
  const attachments = [];

  if (files) {
    if (files['images']) {
      for (const file of files['images']) {
        const { secure_url } = await uploadToCloudinary(file, 'sust-cse/events/images');
        images.push(secure_url);
      }
    }
    if (files['attachments']) {
      for (const file of files['attachments']) {
        const { secure_url } = await uploadToCloudinary(file, 'sust-cse/events/attachments');
        attachments.push(secure_url);
      }
    }
  }

  const event = await Event.create({
    ...data,
    images,
    attachments,
    createdBy: userId,
  });

  // Notify interested users
  const notificationResult = await notifyInterestedUsers('event', event.category, { 
    title: event.title, 
    id: (event._id as any).toString() 
  });

  return {
    ...event.toObject(),
    notificationResult
  };
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
        const { secure_url } = await uploadToCloudinary(file, 'sust-cse/events/images');
        images.push(secure_url);
      }
      updateData.images = [...(event.images || []), ...images];
    }
    if (files['attachments']) {
      const attachments = [];
      for (const file of files['attachments']) {
        const { secure_url } = await uploadToCloudinary(file, 'sust-cse/events/attachments');
        attachments.push(secure_url);
      }
      updateData.attachments = [...(event.attachments || []), ...attachments];
    }
  }

  const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

  if (updatedEvent) {
    await notifyInterestedUsers('event', updatedEvent.category, {
      title: updatedEvent.title,
      id: (updatedEvent._id as any).toString(),
    }, true);
  }

  return updatedEvent;
};

export const deleteEvent = async (id: string) => {
  const event = await Event.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!event) throw new NotFoundError('Event not found');
  return event;
};
