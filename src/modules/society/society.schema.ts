import { Schema, model } from 'mongoose';
import { ISociety, ISocietyMember } from './society.interface';
import { MemberDesignation, SocietyCategory } from './society.types';

const societySchema = new Schema<ISociety>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    logo: { type: String, required: true },
    foundedDate: { type: Date, required: true },
    category: {
      type: String,
      enum: Object.values(SocietyCategory),
      default: SocietyCategory.TECHNICAL,
    },
    socialLinks: {
      facebook: String,
      linkedin: String,
      website: String,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Society = model<ISociety>('Society', societySchema);

const societyMemberSchema = new Schema<ISocietyMember>(
  {
    society: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    designation: {
      type: String,
      enum: Object.values(MemberDesignation),
      required: true,
    },
    tenureStart: { type: Date, required: true },
    tenureEnd: { type: Date },
    isCurrent: { type: Boolean, default: true },
    session: { type: String, required: true }, // Academic session e.g., "2021-22"
    achievements: [String],
    image: { type: String }, // Optional custom image for the member
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Filter out deleted members
societyMemberSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const SocietyMember = model<ISocietyMember>('SocietyMember', societyMemberSchema);
