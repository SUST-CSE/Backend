import { Alumni } from './alumni.schema';
import { AppError } from '@/utils/errors';
import { Student, User } from '../user/user.schema';

const calculateBatch = (session: string) => {
  // Session format: 2021-22 or 2021-2022
  const startYearMatch = session.match(/^(\d{4})/);
  if (!startYearMatch) return session;
  const startYear = parseInt(startYearMatch[1]);
  const batchNum = startYear - 1990;
  
  // Suffix: 1st, 2nd, 3rd, 4-20th etc.
  const suffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return suffix(batchNum) + ' Batch';
};

export const getAllAlumni = async (query: any) => {
  const { batch, search, limit = 50, page = 1 } = query;
  const filter: any = {};

  if (batch) {
    filter.batch = batch;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { currentCompany: { $regex: search, $options: 'i' } },
      { currentPosition: { $regex: search, $options: 'i' } },
    ];
  }

  const alumni = await Alumni.find(filter)
    .sort({ batch: -1, createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Alumni.countDocuments(filter);

  return { alumni, total, page: Number(page), limit: Number(limit) };
};

export const getAlumniById = async (id: string) => {
  const alumni = await Alumni.findById(id);

  if (!alumni) {
    throw new AppError('Alumni not found', 404);
  }

  return alumni;
};

export const createAlumni = async (data: any) => {
  const alumni = await Alumni.create(data);
  return alumni;
};

export const updateAlumni = async (id: string, data: any) => {
  const alumni = await Alumni.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!alumni) {
    throw new AppError('Alumni not found', 404);
  }

  return alumni;
};

export const deleteAlumni = async (id: string) => {
  const alumni = await Alumni.findByIdAndDelete(id);

  if (!alumni) {
    throw new AppError('Alumni not found', 404);
  }

  return alumni;
};

export const addAlumniFromUser = async (userId: string) => {
  const student = await Student.findById(userId);
  if (!student) {
    throw new AppError('Student user not found', 404);
  }

  const alumniData = {
    name: student.name,
    batch: student.batch,
    currentCompany: 'TBA',
    currentPosition: 'Alumni',
    previousCompanies: [],
    profileImage: student.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2680&auto=format&fit=crop',
    description: `Alumni of SUST CSE, ${student.batch}. Registered student ID: ${student.studentId}`,
    quotes: 'SUST CSE is home.',
    linkedIn: student.socialLinks?.linkedin || '',
    facebook: student.socialLinks?.facebook || '',
    instagram: student.socialLinks?.instagram || '',
    website: student.socialLinks?.website || '',
    email: student.email,
  };

  const alumni = await Alumni.create(alumniData);
  
  // Mark student as alumni
  await Student.findByIdAndUpdate(userId, { isAlumni: true });
  
  return alumni;
};

export const graduateSession = async (session: string) => {
  // session input e.g. "2021-22"
  const targetYearMatch = session.match(/^(\d{4})/);
  if (!targetYearMatch) throw new AppError('Invalid session format', 400);
  const targetYear = parseInt(targetYearMatch[1]);

  // Find students where session start year <= targetYear
  // We'll iterate and check OR use a regex for sessions starting with years <= targetYear
  // A safer way: Students usually have enrollmentYear or we can parse session on the fly
  
  const result = await Student.updateMany(
    { 
      $or: [
        { session: { $lte: session } }, // Lexicographical works for YYYY-YY
        { enrollmentYear: { $lte: targetYear } }
      ],
      isAlumni: false 
    },
    { isAlumni: true }
  );

  return result;
};
