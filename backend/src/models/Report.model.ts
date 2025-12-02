import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'water_quality' | 'waste' | 'unsafe_zone' | 'wildlife' | 'infrastructure' | 'other';
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  severity: 'low' | 'medium' | 'high';
  images: string[];
  aiAnalysis?: {
    wasteDetected: boolean;
    wasteTypes: string[];
    confidence: number;
    suggestions: string[];
  };
  status: 'pending' | 'verified' | 'investigating' | 'resolved' | 'rejected';
  verifiedBy?: mongoose.Types.ObjectId;
  verificationNotes?: string;
  verificationDate?: Date;
  relatedEntity?: {
    entityType: 'sensor' | 'unsafe_zone' | 'waste_hotspot';
    entityId: mongoose.Types.ObjectId;
  };
  upvotes: number;
  downvotes: number;
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  rewardPointsAwarded: number;
  isPublic: boolean;
  metadata?: {
    deviceInfo?: string;
    appVersion?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['water_quality', 'waste', 'unsafe_zone', 'wildlife', 'infrastructure', 'other'],
      required: true,
    },
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
    address: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    images: [String],
    aiAnalysis: {
      wasteDetected: Boolean,
      wasteTypes: [String],
      confidence: { type: Number, min: 0, max: 100 },
      suggestions: [String],
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'investigating', 'resolved', 'rejected'],
      default: 'pending',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationNotes: String,
    verificationDate: Date,
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['sensor', 'unsafe_zone', 'waste_hotspot'],
      },
      entityId: Schema.Types.ObjectId,
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rewardPointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    metadata: {
      deviceInfo: String,
      appVersion: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1, type: 1 });
reportSchema.index({ createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', reportSchema);
