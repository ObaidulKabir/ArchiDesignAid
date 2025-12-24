import mongoose, { Schema, Document, Model } from 'mongoose';

export type ElementCategory = 'Bedroom' | 'Living Room' | 'Kitchen' | 'Bathroom' | 'Balcony' | 'Staircase' | 'Lift' | 'Corridor' | 'Furniture' | 'Other';

export interface IDesignElement extends Document {
  name: string;
  category: ElementCategory;
  description?: string;
  
  // Dimensions in meters (standard)
  dimensions: {
    width: { min?: number; max?: number; standard: number };
    length: { min?: number; max?: number; standard: number };
    height?: { min?: number; max?: number; standard: number };
  };
  
  area: {
    min?: number;
    max?: number;
    standard: number;
  };
  
  // For library management
  isSystem: boolean; // True if part of Central Library
  ownerId?: mongoose.Types.ObjectId; // If personal, who owns it
  sourceElementId?: mongoose.Types.ObjectId; // If derived, where from
  
  metadata?: Record<string, any>; // Regulatory refs, etc.
  
  createdAt: Date;
  updatedAt: Date;
}

const DesignElementSchema = new Schema<IDesignElement>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    
    dimensions: {
      width: {
        min: Number,
        max: Number,
        standard: { type: Number, required: true },
      },
      length: {
        min: Number,
        max: Number,
        standard: { type: Number, required: true },
      },
      height: {
        min: Number,
        max: Number,
        standard: Number,
      },
    },
    
    area: {
      min: Number,
      max: Number,
      standard: { type: Number, required: true },
    },
    
    isSystem: { type: Boolean, default: false, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sourceElementId: { type: Schema.Types.ObjectId, ref: 'DesignElement' },
    
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

const DesignElement: Model<IDesignElement> = 
  mongoose.models.DesignElement || mongoose.model<IDesignElement>('DesignElement', DesignElementSchema);

export default DesignElement;
