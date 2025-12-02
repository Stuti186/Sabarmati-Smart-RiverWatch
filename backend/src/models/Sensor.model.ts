import mongoose, { Schema, Document } from 'mongoose';

export interface ISensor extends Document {
  sensorId: string;
  name: string;
  type: 'water_quality' | 'water_level' | 'weather' | 'multi';
  location: {
    type?: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  manufacturer?: string;
  deviceModel?: string;
  installationDate?: Date;
  lastMaintenanceDate?: Date;
  calibrationDate?: Date;
  parameters: string[];
  metadata: {
    riverName?: string;
    riverSegment?: string;
    depth?: number;
    batteryLevel?: number;
    signalStrength?: number;
  };
  alertThresholds?: {
    ph?: { min: number; max: number };
    dissolvedOxygen?: { min: number };
    bod?: { max: number };
    turbidity?: { max: number };
    temperature?: { max: number };
    waterLevel?: { warning: number; danger: number };
  };
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sensorSchema = new Schema<ISensor>(
  {
    sensorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['water_quality', 'water_level', 'weather', 'multi'],
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
    address: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'error'],
      default: 'active',
    },
    manufacturer: String,
    deviceModel: String,
    installationDate: Date,
    lastMaintenanceDate: Date,
    calibrationDate: Date,
    parameters: [String],
    metadata: {
      riverName: String,
      riverSegment: String,
      depth: Number,
      batteryLevel: Number,
      signalStrength: Number,
    },
    alertThresholds: {
      ph: {
        min: Number,
        max: Number,
      },
      dissolvedOxygen: {
        min: Number,
      },
      bod: {
        max: Number,
      },
      turbidity: {
        max: Number,
      },
      temperature: {
        max: Number,
      },
      waterLevel: {
        warning: Number,
        danger: Number,
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
sensorSchema.index({ location: '2dsphere' });
sensorSchema.index({ sensorId: 1 });
sensorSchema.index({ type: 1, status: 1 });

export const Sensor = mongoose.model<ISensor>('Sensor', sensorSchema);
