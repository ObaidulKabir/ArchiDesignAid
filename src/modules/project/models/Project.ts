import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  name: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  landArea: {
    value: number;
    unit: 'sqm' | 'sqft' | 'acre' | 'hectare';
  };
  description?: string;
  notes?: string;
  images: string[]; // URLs to site images
  documents: string[]; // URLs to documents
  maps: string[]; // URLs to location maps
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    landArea: {
      value: { type: Number, required: true },
      unit: {
        type: String,
        enum: ['sqm', 'sqft', 'acre', 'hectare'],
        default: 'sqm',
      },
    },
    description: String,
    notes: String,
    images: [String],
    documents: [String],
    maps: [String],
  },
  { timestamps: true }
);

// Prevent overwriting model during hot reload
const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
