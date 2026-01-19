import { Student, Teacher, User } from '@/modules/user/user.schema';
import { IUser } from '@/modules/user/user.interface';
import { AppError, AuthenticationError, ConflictError } from '@/utils/errors';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt.util';
import { UserRole, UserStatus } from '@/modules/user/user.types';

export const registerStudent = async (data: any) => {
  const isExist = await User.findOne({ email: data.email });
  if (isExist) {
    throw new ConflictError('User with this email already exists');
  }

  const student = (await Student.create({
    ...data,
    role: UserRole.STUDENT,
  })) as any;

  const tokens = {
    accessToken: generateAccessToken({
      userId: student._id.toString(),
      role: student.role,
      email: student.email,
    }),
    refreshToken: generateRefreshToken({
      userId: student._id.toString(),
      role: student.role,
      email: student.email,
    }),
  };

  return { student, tokens };
};

export const registerTeacher = async (data: any) => {
  const isExist = await User.findOne({ email: data.email });
  if (isExist) {
    throw new ConflictError('User with this email already exists');
  }

  const teacher = (await Teacher.create({
    ...data,
    role: UserRole.TEACHER,
    status: UserStatus.PENDING,
  })) as any;

  const tokens = {
    accessToken: generateAccessToken({
      userId: teacher._id.toString(),
      role: teacher.role,
      email: teacher.email,
    }),
    refreshToken: generateRefreshToken({
      userId: teacher._id.toString(),
      role: teacher.role,
      email: teacher.email,
    }),
  };

  return { teacher, tokens };
};

export const loginUser = async (data: any) => {
  const user = (await User.findOne({ email: data.email }).select('+password')) as any;

  if (!user || !(await user.comparePassword(data.password))) {
    throw new AuthenticationError('Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new AuthenticationError('Your account is not active');
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
