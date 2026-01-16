import { Schema, model, Query } from 'mongoose';
import { ICourse, IAcademicAchievement, IAcademicStat } from './academic.interface';
import { AcademicLevel, AchievementType, CourseType } from './academic.types';

const courseSchema = new Schema<ICourse>(
  {
    courseCode: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    credits: { type: Number, required: true },
    type: { type: String, enum: Object.values(CourseType), required: true },
    level: { type: String, enum: Object.values(AcademicLevel), required: true },
    semester: { type: Number, required: true },
    syllabusUrl: { type: String },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

courseSchema.pre('find', function (this: Query<any, ICourse>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

export const Course = model<ICourse>('Course', courseSchema);

const academicAchievementSchema = new Schema<IAcademicAchievement>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: Object.values(AchievementType), required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    attachments: [String],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

academicAchievementSchema.pre('find', function (this: Query<any, IAcademicAchievement>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

export const AcademicAchievement = model<IAcademicAchievement>('AcademicAchievement', academicAchievementSchema);

const academicStatSchema = new Schema<IAcademicStat>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    icon: { type: String },
    category: {
      type: String,
      enum: ['RESEARCH', 'STUDENT', 'FACULTY', 'ALUMNI'],
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AcademicStat = model<IAcademicStat>('AcademicStat', academicStatSchema);
