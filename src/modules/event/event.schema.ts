import { Schema, model, Query } from 'mongoose';
import { IEvent } from './event.interface';
import { EventCategory, EventStatus } from './event.types';

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [String],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.UPCOMING,
    },
    location: { type: String, required: true },
    organizer: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(EventCategory),
      default: EventCategory.TECHNICAL,
    },
    registrationLink: { type: String },
    maxParticipants: { type: Number },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-update status based on dates
eventSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = EventStatus.UPCOMING;
  } else if (now > this.endDate) {
    this.status = EventStatus.COMPLETED;
  } else {
    this.status = EventStatus.ONGOING;
  }
  next();
});

// Filter out deleted events
eventSchema.pre('find', function (this: Query<any, IEvent>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

eventSchema.pre('findOne', function (this: Query<any, IEvent>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

export const Event = model<IEvent>('Event', eventSchema);
