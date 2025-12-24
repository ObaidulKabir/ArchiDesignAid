import mongoose, { Schema, Document, Model } from 'mongoose';

export type ZoneType = 'Floor' | 'Landscape' | 'Podium' | 'Basement' | 'Zone' | 'SubZone';
export type UseType = 'Residential' | 'Commercial' | 'Retail' | 'Parking' | 'Office' | 'Mixed' | 'Circulation' | 'Service' | 'Other';

export interface IZone extends Document {
  projectId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId; // Null for top-level zones (Major Zones)
  name: string;
  type: ZoneType;
  useType: UseType;
  areaAllocation: {
    value: number;
    unit: 'absolute' | 'percentage'; // Percentage of parent area or total land area
  };
  isOverLapping: boolean;
  color?: string; // For visualization
  order: number; // For sorting
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema = new Schema<IZone>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Zone', index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Floor', 'Landscape', 'Podium', 'Basement', 'Zone', 'SubZone'],
      default: 'Zone',
    },
    useType: {
      type: String,
      enum: ['Residential', 'Commercial', 'Retail', 'Parking', 'Office', 'Mixed', 'Circulation', 'Service', 'Other'],
      default: 'Other',
    },
    areaAllocation: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['absolute', 'percentage'], default: 'absolute' },
    },
    isOverLapping: { type: Boolean, default: false },
    color: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent overwriting model during hot reload
const Zone: Model<IZone> = mongoose.models.Zone || mongoose.model<IZone>('Zone', ZoneSchema);

export default Zone;
