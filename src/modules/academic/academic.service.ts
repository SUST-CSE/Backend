import { Course, AcademicAchievement, AcademicStat } from './academic.schema';
import { uploadToCloudinary } from '@/utils/cloudinary.util';
import { NotFoundError } from '@/utils/errors';

// Courses
export const createCourse = async (data: any) => {
  return await Course.create(data);
};

export const getAllCourses = async (query: any) => {
  const filter: any = { isDeleted: false };
  if (query.level) filter.level = query.level;
  if (query.type) filter.type = query.type;
  if (query.semester) filter.semester = query.semester;

  return await Course.find(filter).sort({ semester: 1, courseCode: 1 });
};

export const updateCourse = async (id: string, data: any) => {
  const course = await Course.findByIdAndUpdate(id, data, { new: true });
  if (!course) throw new NotFoundError('Course not found');
  return course;
};

export const deleteCourse = async (id: string) => {
  const course = await Course.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!course) throw new NotFoundError('Course not found');
  return course;
};

// Academic Achievements
export const createAchievement = async (data: any, files: Express.Multer.File[], userId: string) => {
  const attachments = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const { url } = await uploadToCloudinary(file, 'sust-cse/academic/achievements');
      attachments.push(url);
    }
  }

  return await AcademicAchievement.create({
    ...data,
    attachments,
    createdBy: userId,
  });
};

export const getAllAchievements = async (query: any) => {
  const filter: any = { isDeleted: false };
  if (query.type) filter.type = query.type;
  if (query.user) filter.user = query.user;

  return await AcademicAchievement.find(filter)
    .populate('user', 'name email profileImage')
    .populate('createdBy', 'name email')
    .sort({ date: -1 });
};

// Academic Stats
export const updateStat = async (data: any) => {
  const { label, category } = data;
  return await AcademicStat.findOneAndUpdate(
    { label, category },
    { ...data, isDeleted: false },
    { upsert: true, new: true }
  );
};

export const getStats = async () => {
  return await AcademicStat.find({ isDeleted: false });
};
