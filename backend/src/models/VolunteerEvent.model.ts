import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerEvent extends Document {
  title: string;
  description: string;
  type: 'cleanup' | 'awareness' | 'monitoring' | 'tree_planting' | 'other';
  organizer: mongoose.Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  registeredParticipants: Array<{
    userId: mongoose.Types.ObjectId;
    registeredAt: Date;
    attended: boolean;
    wasteCollected?: number;
    hoursContributed?: number;
  }>;
  relatedHotspot?: mongoose.Types.ObjectId;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  requirements: string[];
  providedItems: string[];
  images: string[];
  results?: {
    participantsAttended: number;
    totalWasteCollected: number;
    areaCleanedSqm: number;
    totalHours: number;
  };
  rewardPoints: number;
  isPublic: boolean;
  metadata?: {
    weatherForecast?: string;
    partnerOrganizations?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const volunteerEventSchema = new Schema<IVolunteerEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['cleanup', 'awareness', 'monitoring', 'tree_planting', 'other'],
      required: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    maxParticipants: Number,
    registeredParticipants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        attended: {
          type: Boolean,
          default: false,
        },
        wasteCollected: Number,
        hoursContributed: Number,
      },
    ],
    relatedHotspot: {
      type: Schema.Types.ObjectId,
      ref: 'WasteHotspot',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    requirements: [String],
    providedItems: [String],
    images: [String],
    results: {
      participantsAttended: { type: Number, default: 0 },
      totalWasteCollected: { type: Number, default: 0 },
      areaCleanedSqm: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 },
    },
    rewardPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    metadata: {
      weatherForecast: String,
      partnerOrganizations: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
volunteerEventSchema.index({ location: '2dsphere' });
volunteerEventSchema.index({ startDate: 1, status: 1 });
volunteerEventSchema.index({ organizer: 1 });

export const VolunteerEvent = mongoose.model<IVolunteerEvent>(
  'VolunteerEvent',
  volunteerEventSchema
);
