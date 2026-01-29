import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.util';
import { successResponse } from '../../utils/response.util';
import { User } from './user.schema';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utils/cloudinary.util';
import { AppError, ConflictError } from '../../utils/errors';
import { sendEmail } from '../../utils/email.util';
import crypto from 'crypto';
import { Student, Teacher } from './user.schema';
import { UserRole, UserStatus } from './user.types';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { email, role, status, limit = 50, page = 1, search } = req.query;
  const filter: any = { isDeleted: false };

  if (search) {
    const escapedSearch = (search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = { $regex: escapedSearch, $options: 'i' };
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { studentId: searchRegex },
      { designation: searchRegex }
    ];
  } else if (email) {
    const escapedEmail = (email as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.email = { $regex: escapedEmail, $options: 'i' };
  }

  if (role) {
    filter.role = role;
  }
  if (status) {
    filter.status = status;
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('name email role status phone profileImage studentId designation isEmailVerified createdAt permissions')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  successResponse(res, {
    users,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  }, 'Users fetched successfully');
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const oldUser = await User.findById(id);
  if (!oldUser) {
    throw new AppError('User not found', 404);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Send email if user is approved (PENDING -> ACTIVE)
  if (oldUser.status === UserStatus.PENDING && status === UserStatus.ACTIVE) {
    try {
      await sendEmail({
        to: user.email,
        subject: 'Account Approved - SUST CSE Dashboard',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
            <h2 style="color: #16a34a;">Account Approved!</h2>
            <p>Hello ${user.name},</p>
            <p>Your account on the SUST CSE Dashboard has been approved by the administrator. You can now log in and access all features.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/login" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Dashboard</a>
            </div>
            <p>If you have any questions, please contact the department office.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">SUST CSE Department</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }
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

  if (typeof updates.experiences === 'string') {
    try {
      updates.experiences = JSON.parse(updates.experiences);
    } catch (e) {
      console.error('Error parsing experiences:', e);
    }
  }

  if (typeof updates.researches === 'string') {
    try {
      updates.researches = JSON.parse(updates.researches);
    } catch (e) {
      console.error('Error parsing researches:', e);
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
  const allowedFields = ['name', 'phone', 'profileImage', 'designation', 'researchInterests', 'publications', 'cgpa', 'notificationPreferences', 'socialLinks', 'projectLinks', 'projects', 'experiences', 'researches', 'studentId', 'batch', 'session'];
  
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      sanitizedUpdates[key] = updates[key];
    }
  });

  console.log('📝 Updates to apply:', JSON.stringify(sanitizedUpdates));

  // Use save() instead of findByIdAndUpdate to ensure discriminator fields (batch, session) are handled correctly
  const currentUser = await User.findById(user._id);

  if (!currentUser) {
    throw new AppError('User not found in database', 404);
  }

  // Apply updates
  Object.keys(sanitizedUpdates).forEach((key) => {
    (currentUser as any)[key] = sanitizedUpdates[key];
  });

  await currentUser.save();
  
  console.log('✅ Update successful for:', currentUser.email);
  successResponse(res, currentUser, 'Profile updated successfully');
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Handle nested objects that might be stringified in FormData (optional depends on how frontend sends it)
  // For simplicitly, assume JSON for admin update
  
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  successResponse(res, updatedUser, 'User updated successfully');
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id as string;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Safe Soft Delete: Rename unique fields to avoid collision
  const salt = crypto.randomBytes(4).toString('hex');
  user.isDeleted = true;
  user.email = `deleted_${salt}_${user.email}`;
  // If studentId exists and is unique, rename it too
  if ((user as any).studentId) {
    (user as any).studentId = `deleted_${salt}_${(user as any).studentId}`;
  }
  user.status = UserStatus.INACTIVE; // Ensure they can't login even if isDeleted logic fails
  
  await user.save();

  successResponse(res, null, 'User deleted successfully');
});

export const bulkCreateUsers = asyncHandler(async (req: Request, res: Response) => {
  console.log('🚀 Bulk Create Request received:', req.body);
  const { users, role } = req.body;

  if (!Array.isArray(users)) {
    throw new AppError('Users must be an array', 400);
  }

  const processedUsers = users.map(item => {
    const email = typeof item === 'string' ? item.trim() : item.email.trim();
    const idMatch = email.match(/^(\d+)/);
    const studentId = idMatch ? idMatch[1] : null;
    return { email, studentId, original: item };
  }).filter(u => u.email);

  const emails = processedUsers.map(u => u.email);
  const studentIds = processedUsers.map(u => u.studentId).filter(Boolean) as string[];

  // Pre-validation: Check for existing users (Atomic check)
  const existingUsers = await User.find({
    $or: [
      { email: { $in: emails } },
      { studentId: { $in: studentIds } }
    ]
  }).setOptions({ skipMiddleware: true });

  if (existingUsers.length > 0) {
    const conflicts = existingUsers.map(u => u.email);
    throw new ConflictError(`Bulk creation aborted. The following users already exist: ${conflicts.join(', ')}`);
  }

  const calculateBatch = (year: number) => {
    const batchNum = year - 1990;
    const s = ["th", "st", "nd", "rd"];
    const v = batchNum % 100;
    return batchNum + (s[(v - 20) % 10] || s[v] || s[0]) + ' Batch';
  };

  const results = [];
  for (const item of processedUsers) {
    const { email, studentId } = item;
    const password = crypto.randomBytes(8).toString('hex');
    let newUser;
    
    const baseData = {
      name: role === UserRole.TEACHER ? 'New Faculty' : 'New Student',
      email: email,
      password,
      role: role || UserRole.STUDENT,
      phone: '0000000000',
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    };

    if (role === UserRole.TEACHER) {
      newUser = await Teacher.create({
        ...baseData,
        designation: 'Lecturer',
      });
    } else {
      const finalStudentId = studentId || `S${Date.now()}`;
      const entryYear = parseInt(finalStudentId.substring(0, 4)) || new Date().getFullYear();
      const sessionStr = `${entryYear}-${(entryYear + 1).toString().slice(-2)}`;
      const batchStr = calculateBatch(entryYear);

      newUser = await Student.create({
        ...baseData,
        studentId: finalStudentId,
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
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #16a34a;">Welcome to SUST CSE Dashboard</h2>
          <p>An account has been created for you by an administrator. Here are your login credentials:</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please login and change your password immediately for security.</p>
          <a href="${process.env.CLIENT_URL}/login" style="display:inline-block; background:#16a34a; color:#fff; padding:12px 24px; text-decoration:none; border-radius:5px; font-weight: bold;">Login Now</a>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #64748b; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    });

    results.push({ email, success: true });
  }

  successResponse(res, results, 'Bulk creation completed successfully');
});

// Get Public Faculty List
export const getFaculty = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 50, page = 1 } = req.query;
  const filter = { role: UserRole.TEACHER, status: 'ACTIVE', isDeleted: false };
  
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('name email role designation profileImage researchInterests publications experiences researches socialLinks')
    .sort({ createdAt: 1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  successResponse(res, {
    users,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  }, 'Faculty list fetched successfully');
});

// Get Students List (Protected)
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 50, page = 1, search } = req.query;
  const filter: any = { role: UserRole.STUDENT, status: 'ACTIVE', isDeleted: false };

  if (search) {
    const escapedSearch = (search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { studentId: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .select('name email role studentId batch session profileImage projects experiences researches socialLinks')
    .sort({ studentId: 1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await User.countDocuments(filter);

  successResponse(res, {
    users,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit))
  }, 'Student list fetched successfully');
});

// Get Single Public Profile
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Check if valid MongoDB ID
  if (typeof id !== 'string' || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError('Invalid User ID format', 400);
  }

  // Bypass middleware to check if user exists at all (even if deleted)
  const user = await User.findById(id).select('-password -__v -verificationCode -verificationCodeExpires').setOptions({ skipMiddleware: true });

  if (!user) {
    console.log(`❌ User ${id} not found in DB`);
    throw new AppError('User not found', 404);
  }

  if (user.isDeleted) {
    console.log(`⚠️ User ${id} is deleted`);
    throw new AppError('User profile no longer exists', 410); // Gone
  }

  if (user.status !== 'ACTIVE') {
    console.log(`⚠️ User ${id} is inactive (Status: ${user.status})`);
    throw new AppError('User profile is pending approval or suspended', 403);
  }

  successResponse(res, user, 'User profile fetched successfully');
});
