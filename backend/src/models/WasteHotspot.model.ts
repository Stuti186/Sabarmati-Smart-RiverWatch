import mongoose, { Schema, Document } from 'mongoose';

export interface IWasteHotspot extends Document {
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  radius: number;
  density: number;
  severity: 'low' | 'medium' | 'high';
  wasteTypes: Array<{
    type: string;
    percentage: number;
  }>;
  estimatedVolume?: number;
  description?: string;
  images: string[];
  reportedBy?: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  status: 'reported' | 'verified' | 'cleaning' | 'cleaned' | 'false_alarm';
  cleanupEvents: Array<{
    eventId?: mongoose.Types.ObjectId;
    date: Date;
    volunteers: number;
    wasteCollected: number;
  }>;
  trends: {
    historicalDensity: Array<{
      date: Date;
      density: number;
    }>;
    changeRate: number;
  };
  metadata?: {
    reportCount: number;
    lastReportDate?: Date;
    aiDetectionConfidence?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wasteHotspotSchema = new Schema<IWasteHotspot>(
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
    density: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    wasteTypes: [
      {
        type: {
          type: String,
          required: true,
        },
        percentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],
    estimatedVolume: Number,
    description: String,
    images: [String],
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
      enum: ['reported', 'verified', 'cleaning', 'cleaned', 'false_alarm'],
      default: 'reported',
    },
    cleanupEvents: [
      {
        eventId: {
          type: Schema.Types.ObjectId,
          ref: 'VolunteerEvent',
        },
        date: {
          type: Date,
          required: true,
        },
        volunteers: {
          type: Number,
          min: 0,
        },
        wasteCollected: {
          type: Number,
          min: 0,
        },
      },
    ],
    trends: {
      historicalDensity: [
        {
          date: Date,
          density: Number,
        },
      ],
      changeRate: Number,
    },
    metadata: {
      reportCount: { type: Number, default: 1 },
      lastReportDate: Date,
      aiDetectionConfidence: { type: Number, min: 0, max: 100 },
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
wasteHotspotSchema.index({ location: '2dsphere' });
wasteHotspotSchema.index({ severity: 1, status: 1 });
wasteHotspotSchema.index({ density: -1 });
wasteHotspotSchema.index({ isActive: 1 });

export const WasteHotspot = mongoose.model<IWasteHotspot>('WasteHotspot', wasteHotspotSchema);
