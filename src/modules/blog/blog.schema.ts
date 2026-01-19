import { Schema, model } from 'mongoose';
import { IBlog, BlogStatus } from './blog.interface';

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(BlogStatus),
      default: BlogStatus.PENDING,
    },
    tags: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Filter out deleted blogs
blogSchema.pre(/^find/, function (next) {
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const Blog = model<IBlog>('Blog', blogSchema);
