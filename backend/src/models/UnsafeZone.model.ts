import mongoose, { Schema, Document } from 'mongoose';

export interface IUnsafeZone extends Document {
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  radius: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'contamination' | 'flooding' | 'structural' | 'wildlife' | 'other';
  description: string;
  causes: string[];
  affectedArea: number;
  riskLevel: {
    health: number;
    environmental: number;
    overall: number;
  };
  parameters?: {
    ph?: number;
    dissolvedOxygen?: number;
    bod?: number;
    turbidity?: number;
    temperature?: number;
    toxicSubstances?: string[];
  };
  reportedBy?: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  status: 'reported' | 'verified' | 'investigating' | 'resolved' | 'false_alarm';
  images: string[];
  safetyRecommendations: string[];
  estimatedCleanupCost?: number;
  cleanupProgress?: number;
  metadata?: {
    reportCount: number;
    lastReportDate?: Date;
    authorities_notified?: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const unsafeZoneSchema = new Schema<IUnsafeZone>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    radius: {
      type: Number,
      required: true,
      min: 0,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    type: {
      type: String,
      enum: ['contamination', 'flooding', 'structural', 'wildlife', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    causes: [String],
    affectedArea: {
      type: Number,
      min: 0,
    },
    riskLevel: {
      health: { type: Number, min: 0, max: 100, required: true },
      environmental: { type: Number, min: 0, max: 100, required: true },
      overall: { type: Number, min: 0, max: 100, required: true },
    },
    parameters: {
      ph: Number,
      dissolvedOxygen: Number,
      bod: Number,
      turbidity: Number,
      temperature: Number,
      toxicSubstances: [String],
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationDate: Date,
    status: {
      type: String,
      enum: ['reported', 'verified', 'investigating', 'resolved', 'false_alarm'],
      default: 'reported',
    },
    images: [String],
    safetyRecommendations: [String],
    estimatedCleanupCost: Number,
    cleanupProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    metadata: {
      reportCount: { type: Number, default: 1 },
      lastReportDate: Date,
      authorities_notified: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
unsafeZoneSchema.index({ location: '2dsphere' });
unsafeZoneSchema.index({ severity: 1, status: 1 });
unsafeZoneSchema.index({ isActive: 1 });

export const UnsafeZone = mongoose.model<IUnsafeZone>('UnsafeZone', unsafeZoneSchema);
