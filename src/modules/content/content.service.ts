import { HomePage, Notice, Achievement } from './content.schema';
import { uploadToCloudinary } from '@/utils/cloudinary.util';
import { Types } from 'mongoose';
import { NotFoundError } from '@/utils/errors';

// HomePage
export const getHomePage = async () => {
  return await HomePage.findOne().populate('updatedBy', 'name email');
};

export const updateHomePage = async (data: any, file: Express.Multer.File | undefined, userId: string) => {
  let homepage = await HomePage.findOne();

  const updateData = { ...data, updatedBy: userId };

  if (file) {
    const { url } = await uploadToCloudinary(file, 'sust-cse/homepage');
    updateData.heroImage = url;
  }

  if (homepage) {
    return await HomePage.findByIdAndUpdate(homepage._id, updateData, { new: true });
  } else {
    return await HomePage.create(updateData);
  }
};

// Notices
export const createNotice = async (data: any, files: Express.Multer.File[], userId: string) => {
  const attachments = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const { url } = await uploadToCloudinary(file, 'sust-cse/notices');
      attachments.push(url);
    }
  }

  return await Notice.create({
    ...data,
    attachments,
    createdBy: userId,
  });
};

export const getAllNotices = async (filters: any) => {
  const query: any = { isDeleted: false };
  if (filters.category) query.category = filters.category;
  
  return await Notice.find(query)
    .sort({ isPinned: -1, publishDate: -1 })
    .populate('createdBy', 'name email');
};

export const deleteNotice = async (id: string) => {
  const notice = await Notice.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!notice) throw new NotFoundError('Notice not found');
  return notice;
};

export const getNoticeById = async (id: string) => {
  const notice = await Notice.findById(id).populate('createdBy', 'name email');
  if (!notice) throw new NotFoundError('Notice not found');
  return notice;
};

// Achievements
export const createAchievement = async (data: any, files: Express.Multer.File[], userId: string) => {
  const images = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const { url } = await uploadToCloudinary(file, 'sust-cse/achievements');
      images.push(url);
    }
  }

  return await Achievement.create({
    ...data,
    images,
    createdBy: userId,
  });
};

export const getAllAchievements = async (filters: any) => {
  const query: any = { isDeleted: false };
  if (filters.category) query.category = filters.category;
  if (filters.achievedBy) query.achievedBy = filters.achievedBy;

  return await Achievement.find(query)
    .sort({ date: -1 })
    .populate('achievedBy', 'name email profileImage')
    .populate('createdBy', 'name email');
};

export const deleteAchievement = async (id: string) => {
  const achievement = await Achievement.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!achievement) throw new NotFoundError('Achievement not found');
  return achievement;
};
