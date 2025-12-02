import mongoose, { Schema, Document } from 'mongoose';

export interface IWaterQuality extends Document {
  sensorId: mongoose.Types.ObjectId;
  timestamp: Date;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  parameters: {
    ph?: number;
    dissolvedOxygen?: number;
    bod?: number;
    turbidity?: number;
    temperature?: number;
    conductivity?: number;
    tds?: number;
    nitrate?: number;
    phosphate?: number;
    ammonia?: number;
  };
  qualityIndex: {
    score: number;
    category: 'excellent' | 'good' | 'moderate' | 'poor' | 'very_poor';
    color: string;
  };
  alerts: Array<{
    parameter: string;
    value: number;
    threshold: number;
    severity: 'info' | 'warning' | 'danger';
  }>;
  metadata?: {
    weather?: string;
    rainfall?: number;
    flowRate?: number;
  };
  isValidated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const waterQualitySchema = new Schema<IWaterQuality>(
  {
    sensorId: {
      type: Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
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
    parameters: {
      ph: { type: Number, min: 0, max: 14 },
      dissolvedOxygen: { type: Number, min: 0 },
      bod: { type: Number, min: 0 },
      turbidity: { type: Number, min: 0 },
      temperature: { type: Number },
      conductivity: { type: Number, min: 0 },
      tds: { type: Number, min: 0 },
      nitrate: { type: Number, min: 0 },
      phosphate: { type: Number, min: 0 },
      ammonia: { type: Number, min: 0 },
    },
    qualityIndex: {
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      category: {
        type: String,
        enum: ['excellent', 'good', 'moderate', 'poor', 'very_poor'],
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
    },
    alerts: [
      {
        parameter: String,
        value: Number,
        threshold: Number,
        severity: {
          type: String,
          enum: ['info', 'warning', 'danger'],
        },
      },
    ],
    metadata: {
      weather: String,
      rainfall: Number,
      flowRate: Number,
    },
    isValidated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
waterQualitySchema.index({ sensorId: 1, timestamp: -1 });
waterQualitySchema.index({ location: '2dsphere' });
waterQualitySchema.index({ timestamp: -1 });
waterQualitySchema.index({ 'qualityIndex.category': 1 });

export const WaterQuality = mongoose.model<IWaterQuality>('WaterQuality', waterQualitySchema);
