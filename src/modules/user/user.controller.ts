import { Request, Response } from 'express';
import { asyncHandler } from '@/utils/asyncHandler.util';
import { successResponse } from '@/utils/response.util';
import { User } from './user.schema';
import { uploadToCloudinary, deleteFromCloudinary } from '@/utils/cloudinary.util';
import { AppError } from '@/utils/errors';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { email, role, status, limit = 50, page = 1 } = req.query;
  const filter: any = { isDeleted: false };

  if (email) {
    filter.email = { $regex: email, $options: 'i' };
  }
  if (role) {
    filter.role = role;
  }
  if (status) {
    filter.status = status;
  }

  const users = await User.find(filter)
    .select('name email role status phone profileImage studentId designation isEmailVerified createdAt')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  successResponse(res, users, 'Users fetched successfully');
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  successResponse(res, user, `User status updated to ${status} successfully`);
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const updates = req.body;

  console.log('>>> UPDATE PROFILE START <<<');
  console.log('User ID from Auth:', user?._id);
  
  if (!user?._id) {
    throw new AppError('Authentication failed: user ID missing', 401);
  }

  // Handle nested objects that might be stringified in FormData
  if (typeof updates.notificationPreferences === 'string') {
    try {
      updates.notificationPreferences = JSON.parse(updates.notificationPreferences);
    } catch (e) {
      console.error('Error parsing notificationPreferences:', e);
    }
  }

  // Handle profile image upload
  if (req.file) {
    console.log('📸 Uploading image...');
    const uploadResult = await uploadToCloudinary(req.file, 'profiles');
    updates.profileImage = uploadResult.secure_url;
  }

  // Prevent updating sensitive fields
  const sanitizedUpdates: any = {};
  const allowedFields = ['name', 'phone', 'profileImage', 'designation', 'researchInterests', 'publications', 'cgpa', 'notificationPreferences'];
  
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      sanitizedUpdates[key] = updates[key];
    }
  });

  console.log('📝 Updates to apply:', JSON.stringify(sanitizedUpdates));

  // Use findByIdAndUpdate with explicit string ID to avoid any casting issues
  const updatedUser = await User.findByIdAndUpdate(
    user._id.toString(),
    { $set: sanitizedUpdates },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    console.error('❌ User not found in DB with ID:', user._id.toString());
    // Try one more time bypassing filters
    const rawUser = await User.findOne({ _id: user._id }).setOptions({ skipMiddleware: true });
    if (rawUser) {
      console.log('⚠️ User found only when bypassing middleware!');
    }
    throw new AppError('User not found in database', 404);
  }

  console.log('✅ Update successful for:', updatedUser.email);
  successResponse(res, updatedUser, 'Profile updated successfully');
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  successResponse(res, null, 'User deleted successfully');
});
