import { Student, Teacher, User } from '../../modules/user/user.schema';
import { IUser } from '../../modules/user/user.interface';
import { AppError, AuthenticationError, ConflictError } from '../../utils/errors';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.util';
import { UserRole, UserStatus } from '../../modules/user/user.types';
import { sendVerificationEmail } from '../../utils/email.util';
import crypto from 'crypto';

const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const registerStudent = async (data: any) => {
  // Check email uniqueness
  const existingEmail = await User.findOne({ email: data.email });
  if (existingEmail) {
    if (!existingEmail.isEmailVerified) {
       throw new ConflictError('User with this email already exists. Please check your email for verification code.');
    }
    throw new ConflictError('User with this email already exists');
  }

  // Check student ID uniqueness if provided - Check base User to catch all discriminators
  if (data.studentId) {
    const existingStudent = await User.findOne({ studentId: data.studentId });
    if (existingStudent) {
      throw new ConflictError(`A student account with ID ${data.studentId} already exists. If you were added by admin, please contact them to reset your password instead of registering again.`);
    }
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Auto-approve if official email
  const isOfficial = data.email.endsWith('@student.sust.edu') || data.email.endsWith('@sust.edu');
  const status = isOfficial ? UserStatus.ACTIVE : UserStatus.PENDING;

  const student = (await Student.create({
    ...data,
    role: UserRole.STUDENT,
    status, // Set status dynamically
    verificationCode,
    verificationCodeExpires,
    isEmailVerified: false,
  })) as any;

  // Send verification email
  await sendVerificationEmail(student.email, verificationCode);

  return { 
    user: student,
    message: isOfficial 
      ? 'Registration successful. Please verify your email to activate your account.' 
      : 'Registration successful. Verify your email. Note: External accounts require Admin approval.'
  };
};

export const registerTeacher = async (data: any) => {
  const isExist = await User.findOne({ email: data.email });
  if (isExist) {
    throw new ConflictError('User with this email already exists');
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Auto-approve if official email (though teachers usually need manual approval regardless, user logic implies differentiation)
  const isOfficial = data.email.endsWith('@sust.edu');
  const status = isOfficial ? UserStatus.ACTIVE : UserStatus.PENDING;

  const teacher = (await Teacher.create({
    ...data,
    role: UserRole.TEACHER,
    status,
    verificationCode,
    verificationCodeExpires,
    isEmailVerified: false,
  })) as any;

  // Send verification email
  await sendVerificationEmail(teacher.email, verificationCode);

  return { 
    user: teacher,
    message: isOfficial 
      ? 'Registration successful. Please verify your email.' 
      : 'Registration successful. Verify your email. External accounts require Admin approval.'
  };
};

export const loginUser = async (data: any) => {
  const user = (await User.findOne({ email: data.email }).select('+password')) as any;

  if (!user || !(await user.comparePassword(data.password))) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email address before logging in. Check your email for the verification code.', 403);
  }

  if (user.status !== 'ACTIVE') {
    throw new AuthenticationError('Your account is not active. Please contact admin.');
  }

  const tokens = {
    accessToken: generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    }),
    refreshToken: generateRefreshToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    }),
  };

  return { user, tokens };
};

export const verifyEmail = async (email: string, code: string) => {
  console.log(`🔍 Attempting email verification for: ${email} with code: ${code}`);
  const user = (await User.findOne({ email }).select('+verificationCode +verificationCodeExpires')) as any;

  if (!user) {
    console.warn(`❌ Verification failed: User not found for email ${email}`);
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    console.warn(`❌ Verification failed: Email already verified for ${email}`);
    throw new AppError('Email is already verified', 400);
  }

  if (!user.verificationCode || !user.verificationCodeExpires) {
    console.warn(`❌ Verification failed: No code/expiry found for ${email}`);
    throw new AppError('No verification code found. Please request a new one.', 400);
  }

  console.log(`📊 DB Code: ${user.verificationCode}, Input Code: ${code}`);
  console.log(`⏰ Code Expires: ${user.verificationCodeExpires}, Current Time: ${new Date()}`);

  if (user.verificationCodeExpires < new Date()) {
    console.warn(`❌ Verification failed: Code expired for ${email}`);
    throw new AppError('Verification code has expired. Please request a new one.', 400);
  }

  if (user.verificationCode !== code) {
    console.warn(`❌ Verification failed: Code mismatch for ${email}. Expected ${user.verificationCode}, got ${code}`);
    throw new AppError('Invalid verification code', 400);
  }

  console.log(`✅ Verification successful for ${email}`);

  user.isEmailVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  const tokens = {
    accessToken: generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    }),
    refreshToken: generateRefreshToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    }),
  };

  return { user, tokens };
};

export const resendVerificationCode = async (email: string) => {
  const user = (await User.findOne({ email })) as any;

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.verificationCode = verificationCode;
  user.verificationCodeExpires = verificationCodeExpires;
  await user.save();

  await sendVerificationEmail(user.email, verificationCode);

  return { message: 'Verification code has been resent to your email' };
};

export const forgotPassword = async (email: string) => {
  const user = (await User.findOne({ email })) as any;

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.verificationCode = verificationCode;
  user.verificationCodeExpires = verificationCodeExpires;
  await user.save();

  await sendVerificationEmail(user.email, verificationCode); // Reusing verification email template for now, or could create a new one

  return { message: 'Password reset code sent to email' };
};

export const resetPassword = async (data: any) => {
  const { email, code, newPassword } = data;
  const user = (await User.findOne({ email }).select('+verificationCode +verificationCodeExpires')) as any;

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.verificationCode !== code) {
    throw new AppError('Invalid verification code', 400);
  }

  if (user.verificationCodeExpires < new Date()) {
    throw new AppError('Verification code expired', 400);
  }

  user.password = newPassword;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  return { message: 'Password reset successfully' };
};

export const changePassword = async (userId: string, data: any) => {
  const { oldPassword, newPassword } = data;
  const user = (await User.findById(userId).select('+password')) as any;

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new AuthenticationError('Invalid current password');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};
