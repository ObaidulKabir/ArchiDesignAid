import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlacedElement {
  elementId: mongoose.Types.ObjectId; // Reference to DesignElement
  instanceId: string; // Unique ID for this instance in the layout
  name: string; // Snapshot of name
  position: { x: number; y: number; z?: number };
  rotation: number;
  dimensions: { width: number; length: number; height?: number };
  properties?: Record<string, any>;
}

export interface IZoneLayout extends Document {
  zoneId: mongoose.Types.ObjectId;
  container?: {
    width: number;   // meters
    length: number;  // meters
  };
  elements: IPlacedElement[];
  version: number;
  lastModifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlacedElementSchema = new Schema({
  elementId: { type: Schema.Types.ObjectId, ref: 'DesignElement', required: true },
  instanceId: { type: String, required: true },
  name: String,
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  rotation: { type: Number, default: 0 },
  dimensions: {
    width: { type: Number, required: true },
    length: { type: Number, required: true },
    height: Number,
  },
  properties: Schema.Types.Mixed,
});

const ZoneLayoutSchema = new Schema<IZoneLayout>(
  {
    zoneId: { type: Schema.Types.ObjectId, ref: 'Zone', required: true, unique: true },
    container: {
      width: { type: Number },
      length: { type: Number },
    },
    elements: [PlacedElementSchema],
    version: { type: Number, default: 1 },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const ZoneLayout: Model<IZoneLayout> =
  mongoose.models.ZoneLayout || mongoose.model<IZoneLayout>('ZoneLayout', ZoneLayoutSchema);

export default ZoneLayout;
