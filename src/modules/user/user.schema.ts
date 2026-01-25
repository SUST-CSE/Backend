import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IStudent, ITeacher, IUserMethods, UserModel } from './user.interface';
import { UserRole, UserStatus } from './user.types';

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    profileImage: {
      type: String,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      notices: { type: [String], default: [] },
      events: { type: [String], default: [] },
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      instagram: { type: String, trim: true },
      website: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'role',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password!, 10);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password!);
};

// Filter out deleted users by default
userSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const User = model<IUser, UserModel>('User', userSchema);

// Student Discriminator
const studentSchema = new Schema<IStudent>({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
  },
  batch: {
    type: String,
    required: [true, 'Batch is required'],
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
  },
  cgpa: {
    type: Number,
  },
  enrollmentYear: {
    type: Number,
    required: [true, 'Enrollment year is required'],
  },
  // projectLinks: { // Keeping old structure for migration if needed, but per plan replacing/adding
  //   github: { type: String, trim: true },
  //   liveLink: { type: String, trim: true },
  // },
  projects: [{
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    githubLink: { type: String, trim: true },
    liveLink: { type: String, trim: true },
    technologies: [String]
  }],
  isAlumni: {
    type: Boolean,
    default: false,
  },
});

export const Student = User.discriminator('STUDENT', studentSchema);

// Teacher Discriminator
const teacherSchema = new Schema<ITeacher>({
  designation: {
    type: String,
    required: [true, 'Designation is required'],
  },
  department: {
    type: String,
    default: 'Computer Science and Engineering',
  },
  researchInterests: [String],
  publications: [String],
});

export const Teacher = User.discriminator('TEACHER', teacherSchema);

// Admin Discriminator
const adminSchema = new Schema<IUser>({});
export const Admin = User.discriminator('ADMIN', adminSchema);
