import { Schema, model, Query } from 'mongoose';
import { ITournament, IPlayerShowcase } from './sports.interface';
import { SportType, TournamentStatus } from './sports.types';

const tournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true, trim: true },
    sportType: {
      type: String,
      enum: Object.values(SportType),
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(TournamentStatus),
      default: TournamentStatus.UPCOMING,
    },
    winner: { type: String },
    runnerUp: { type: String },
    bestPlayer: { type: String },
    images: [String],
    description: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-update status based on dates
tournamentSchema.pre('save', function (next) {
  const now = new Date();
  if (now < this.startDate) {
    this.status = TournamentStatus.UPCOMING;
  } else if (now > this.endDate) {
    this.status = TournamentStatus.COMPLETED;
  } else {
    this.status = TournamentStatus.ONGOING;
  }
  next();
});

// Filter out deleted tournaments
tournamentSchema.pre('find', function (this: Query<any, ITournament>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

tournamentSchema.pre('findOne', function (this: Query<any, ITournament>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});


export const Tournament = model<ITournament>('Tournament', tournamentSchema);

const playerShowcaseSchema = new Schema<IPlayerShowcase>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sportType: {
      type: String,
      enum: Object.values(SportType),
      required: true,
    },
    achievements: [String],
    totalMatches: { type: Number, default: 0 },
    stats: { type: Map, of: Schema.Types.Mixed },
    image: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Filter out deleted showcases
playerShowcaseSchema.pre('find', function (this: Query<any, IPlayerShowcase>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

playerShowcaseSchema.pre('findOne', function (this: Query<any, IPlayerShowcase>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});


export const PlayerShowcase = model<IPlayerShowcase>('PlayerShowcase', playerShowcaseSchema);
