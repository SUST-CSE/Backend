import { Schema, model } from 'mongoose';
import { IAchievement, IHomePage, INotice } from './content.interface';
import { AchievementCategory, NoticeCategory, TargetAudience } from './content.types';

// HomePage Schema
const heroSlideSchema = new Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String },
});

const homePageSchema = new Schema<any>(
  {
    heroSlides: [heroSlideSchema],
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Legacy fields for cleanup
    heroImage: { type: String },
    heroImages: [{ type: String }],
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    ctaText: { type: String },
    ctaLink: { type: String },
  },
  { timestamps: true, strict: false }
);

export const HomePage = model<IHomePage>('SiteContent', homePageSchema);

// Notice Schema
const noticeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    attachments: [String],
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    isPinned: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false },
    targetAudience: {
      type: String,
      enum: Object.values(TargetAudience),
      default: TargetAudience.BOTH,
    },
    shouldSendEmail: { type: Boolean, default: true },
    category: {
      type: String,
      enum: Object.values(NoticeCategory),
      default: NoticeCategory.GENERAL,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notice = model<INotice>('Notice', noticeSchema);

// Achievement Schema
const achievementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    teamName: { type: String },
    competitionName: { type: String, required: true },
    position: { type: String, required: true },
    image: { type: String, required: true },
    achievedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, required: true },
    category: {
      type: String,
      enum: Object.values(AchievementCategory),
      default: AchievementCategory.CP,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Achievement = model<IAchievement>('Achievement', achievementSchema);

// Important Data Schema (PDFs/Images)
const importantDataSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    file: { type: String, required: true },
    type: { type: String, enum: ['PDF', 'IMAGE'], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const ImportantData = model('ImportantData', importantDataSchema);
