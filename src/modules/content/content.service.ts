import { HomePage, Notice, Achievement } from './content.schema';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { Types } from 'mongoose';
import { NotFoundError } from '../../utils/errors';
import { notifyInterestedUsers } from '../../utils/notification.util';

// HomePage
export const getHomePage = async () => {
  const homepage = await HomePage.findOne().populate('updatedBy', 'name email');
  return homepage || { heroSlides: [] };
};

export const updateHomePage = async (data: any, files: Express.Multer.File[] | undefined, userId: string) => {
  console.log('=== updateHomePage called ===');
  console.log('Files received:', files ? files.length : 0);
  console.log('Files array:', files);
  console.log('Data received:', data);
  
  let homepage = await HomePage.findOne();
  if (!homepage) {
    homepage = new HomePage({ heroSlides: [], updatedBy: userId });
  }

  // Ensure heroSlides is an array
  let currentSlides = Array.isArray(homepage.heroSlides) ? [...homepage.heroSlides] : [];
  
  const parseIdx = (val: any) => {
    if (val === undefined || val === 'undefined' || val === 'null' || val === null || val === '') return undefined;
    const p = parseInt(String(val));
    return isNaN(p) ? undefined : p;
  };

  const deleteIndex = parseIdx(data.deleteSlideIndex);
  const editIndex = parseIdx(data.editSlideIndex);

  // 1. Handle Deletion
  if (deleteIndex !== undefined && deleteIndex >= 0 && deleteIndex < currentSlides.length) {
    currentSlides.splice(deleteIndex, 1);
  }

  // 2. Handle New/Update
  const clean = (v: any) => (v === undefined || v === 'undefined' || v === 'null' || v === null) ? '' : String(v);

  if (files && files.length > 0) {
    console.log('Uploading file to Cloudinary...');
    console.log('File details:', {
      filename: files[0].originalname,
      mimetype: files[0].mimetype,
      size: files[0].size,
      hasBuffer: !!files[0].buffer
    });
    
    try {
      const { secure_url } = await uploadToCloudinary(files[0], 'sust-cse/homepage');
      console.log('Cloudinary upload successful! URL:', secure_url);
      
      const slideData = {
        title: clean(data.title) || 'New Slide',
        subtitle: clean(data.subtitle),
        description: clean(data.description),
        ctaText: clean(data.ctaText),
        ctaLink: clean(data.ctaLink),
        image: secure_url
      };

      if (editIndex !== undefined && editIndex >= 0 && editIndex < currentSlides.length) {
        currentSlides[editIndex] = slideData;
      } else if (deleteIndex === undefined) { 
        currentSlides.push(slideData);
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  } else if (data.title && editIndex !== undefined) {
    console.log('No files received, updating text only');
    if (editIndex >= 0 && editIndex < currentSlides.length) {
      currentSlides[editIndex] = {
        title: clean(data.title),
        subtitle: clean(data.subtitle),
        description: clean(data.description),
        ctaText: clean(data.ctaText),
        ctaLink: clean(data.ctaLink),
        image: currentSlides[editIndex].image
      };
    }
  } else {
    console.log('No files and no valid update operation');
  }

  // Final update
  homepage.heroSlides = currentSlides;
  homepage.updatedBy = new Types.ObjectId(userId);

  return await homepage.save();
};

// Notices
export const createNotice = async (data: any, files: Express.Multer.File[], userId: string) => {
  const attachments = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const { secure_url } = await uploadToCloudinary(file, 'sust-cse/notices');
      attachments.push(secure_url);
    }
  }

  const notice = await Notice.create({
    ...data,
    attachments,
    createdBy: userId,
  });

  // Notify interested users
  const notificationResult = await notifyInterestedUsers('notice', notice.category, {
    title: notice.title,
    id: (notice._id as any).toString(),
    targetAudience: notice.targetAudience,
    shouldSendEmail: notice.shouldSendEmail,
    isImportant: notice.isImportant,
  });

  return {
    ...notice.toObject(),
    notificationResult
  };
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
  let image = '';
  if (files && files.length > 0) {
    const { secure_url } = await uploadToCloudinary(files[0], 'sust-cse/achievements');
    image = secure_url;
  }

  return await Achievement.create({
    ...data,
    image,
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

export const getAchievementById = async (id: string) => {
  const achievement = await Achievement.findById(id).populate('achievedBy', 'name email profileImage').populate('createdBy', 'name email');
  if (!achievement) throw new NotFoundError('Achievement not found');
  return achievement;
};
