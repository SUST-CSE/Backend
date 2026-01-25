import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import { User } from './user.schema';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utils/cloudinary.util';
import { AppError } from '../../utils/errors';
import { sendEmail } from '../../utils/email.util';
import crypto from 'crypto';
import { Student, Teacher } from './user.schema';
import { UserRole } from './user.types';

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

  if (typeof updates.socialLinks === 'string') {
    try {
      updates.socialLinks = JSON.parse(updates.socialLinks);
    } catch (e) {
      console.error('Error parsing socialLinks:', e);
    }
  }

  if (typeof updates.projectLinks === 'string') {
    try {
      updates.projectLinks = JSON.parse(updates.projectLinks);
    } catch (e) {
      console.error('Error parsing projectLinks:', e);
    }
  }

  if (typeof updates.projects === 'string') {
    try {
      updates.projects = JSON.parse(updates.projects);
    } catch (e) {
      console.error('Error parsing projects:', e);
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
  const allowedFields = ['name', 'phone', 'profileImage', 'designation', 'researchInterests', 'publications', 'cgpa', 'notificationPreferences', 'socialLinks', 'projectLinks', 'projects', 'studentId', 'batch', 'session'];
  
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

export const bulkCreateUsers = asyncHandler(async (req: Request, res: Response) => {
  console.log('🚀 Bulk Create Request received:', req.body);
  const { users, role } = req.body; // users is now array of strings (emails) or objects

  if (!Array.isArray(users)) {
    throw new AppError('Users must be an array', 400);
  }

  const calculateBatch = (year: number) => {
    const batchNum = year - 1990;
    const s = ["th", "st", "nd", "rd"];
    const v = batchNum % 100;
    return batchNum + (s[(v - 20) % 10] || s[v] || s[0]) + ' Batch';
  };

  const results = [];
  for (const item of users) {
    try {
      const email = typeof item === 'string' ? item.trim() : item.email.trim();
      if (!email) continue;

      // Check if user already exists by email (bypassing filters like isDeleted)
      const existingUserByEmail = await User.findOne({ email }).setOptions({ skipMiddleware: true });
      if (existingUserByEmail) {
        results.push({ email, success: false, error: 'User with this email already exists' });
        continue;
      }

      const password = crypto.randomBytes(8).toString('hex');
      let newUser;
      
      const baseData = {
        name: 'New Student',
        email: email,
        password,
        role: role || UserRole.STUDENT,
        phone: '0000000000',
        status: 'ACTIVE',
        isEmailVerified: true,
      };

      if (role === UserRole.TEACHER) {
        newUser = await Teacher.create({
          ...baseData,
          name: 'New Faculty',
          designation: 'Lecturer',
        });
      } else {
        // Only extract ID if it's a student or default
        const idMatch = email.match(/^(\d+)/);
        const studentId = idMatch ? idMatch[1] : `S${Date.now()}`;

        // Check if student already exists by studentId (bypassing filters)
        const existingStudentById = await User.findOne({ studentId }).setOptions({ skipMiddleware: true });
        if (existingStudentById) {
          results.push({ email, success: false, error: `Student with ID ${studentId} already exists` });
          continue;
        }

        const entryYear = parseInt(studentId.substring(0, 4)) || new Date().getFullYear();
        const sessionStr = `${entryYear}-${(entryYear + 1).toString().slice(-2)}`;
        const batchStr = calculateBatch(entryYear);

        newUser = await Student.create({
          ...baseData,
          studentId,
          batch: batchStr,
          session: sessionStr,
          enrollmentYear: entryYear,
        });
      }

      // Send Email
      await sendEmail({
        to: email,
        subject: 'SUST CSE Account Created',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
            <h2>Welcome to SUST CSE Dashboard</h2>
            <p>An account has been created for you. Here are your credentials:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please login and change your password immediately.</p>
            <a href="${process.env.CLIENT_URL}/login" style="display:inline-block; background:#16a34a; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px;">Login Now</a>
          </div>
        `
      });

      results.push({ email, success: true });
    } catch (err: any) {
      console.error('❌ Bulk Create Error for', item, ':', err);
      results.push({ email: typeof item === 'string' ? item : (item as any).email, success: false, error: err.message });
    }
  }

  successResponse(res, results, 'Bulk creation completed');
});
