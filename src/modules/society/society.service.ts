import { Society, SocietyMember } from './society.schema';
import { uploadToCloudinary } from '../../utils/cloudinary.util';
import { NotFoundError } from '../../utils/errors';

// Societies
export const createSociety = async (data: any, file: Express.Multer.File, userId: string) => {
  const { secure_url } = await uploadToCloudinary(file, 'sust-cse/societies');
  
  return await Society.create({
    ...data,
    logo: secure_url,
    createdBy: userId,
  });
};

export const getAllSocieties = async (query: any) => {
  const filter: any = { isDeleted: false };
  if (query.category) filter.category = query.category;

  return await Society.find(filter).populate('createdBy', 'name email');
};

export const getSocietyById = async (id: string) => {
  const society = await Society.findById(id).populate('createdBy', 'name email');
  if (!society) throw new NotFoundError('Society not found');
  return society;
};

export const updateSociety = async (id: string, data: any, file: Express.Multer.File | undefined) => {
  let updates = { ...data };
  if (file) {
    const { secure_url } = await uploadToCloudinary(file, 'sust-cse/societies');
    updates.logo = secure_url;
  }
  
  const society = await Society.findByIdAndUpdate(id, updates, { new: true });
  if (!society) throw new NotFoundError('Society not found');
  return society;
};

// Members
export const addMember = async (societyId: string, data: any, file: Express.Multer.File | undefined, userId: string) => {
  const society = await Society.findById(societyId);
  if (!society) throw new NotFoundError('Society not found');

  let imageUrl;
  if (file) {
    const { secure_url } = await uploadToCloudinary(file, 'sust-cse/societies/members');
    imageUrl = secure_url;
  }

  return await SocietyMember.create({
    ...data,
    image: imageUrl,
    society: societyId,
    createdBy: userId,
  });
};

export const getSocietyMembers = async (societyId: string, query: any) => {
  const filter: any = { society: societyId, isDeleted: false };
  if (query.isCurrent !== undefined) filter.isCurrent = query.isCurrent === 'true';

  return await SocietyMember.find(filter)
    .populate('user', 'name email studentId profileImage phone role designation')
    .sort({ tenureStart: -1 });
};

export const updateMember = async (memberId: string, data: any) => {
  const member = await SocietyMember.findByIdAndUpdate(memberId, data, { new: true });
  if (!member) throw new NotFoundError('Member record not found');
  return member;
};

export const removeMember = async (memberId: string) => {
  const member = await SocietyMember.findByIdAndUpdate(memberId, { isDeleted: true }, { new: true });
  if (!member) throw new NotFoundError('Member record not found');
  return member;
};
