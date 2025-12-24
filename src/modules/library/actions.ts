'use server';

import connectDB from '@/lib/db';
import DesignElement, { IDesignElement } from './models/DesignElement';
import { designElementSchema, DesignElementFormData } from './schema';
import { revalidatePath } from 'next/cache';

export async function getSystemLibrary() {
  try {
    await connectDB();
    const elements = await DesignElement.find({ isSystem: true }).lean();
    return elements.map(e => ({
      ...e,
      _id: e._id.toString(),
      createdAt: e.createdAt?.toISOString(),
      updatedAt: e.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch library:', error);
    return [];
  }
}

export async function createDesignElement(data: DesignElementFormData) {
  try {
    await connectDB();
    const validatedData = designElementSchema.parse(data);
    await DesignElement.create(validatedData);
    revalidatePath('/library'); // Assuming we have a library page
    return { success: true };
  } catch (error) {
    console.error('Failed to create element:', error);
    return { success: false, error: 'Failed to create element' };
  }
}

export async function updateDesignElement(id: string, data: DesignElementFormData) {
  try {
    await connectDB();
    const validatedData = designElementSchema.parse(data);
    
    const updatedElement = await DesignElement.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!updatedElement) {
      return { success: false, error: 'Element not found' };
    }

    revalidatePath('/library');
    return { success: true };
  } catch (error) {
    console.error('Failed to update element:', error);
    return { success: false, error: 'Failed to update element' };
  }
}

export async function seedLibrary() {
  try {
    await connectDB();
    
    const count = await DesignElement.countDocuments({ isSystem: true });
    if (count > 0) return { success: true, message: 'Library already seeded' };

    const initialElements: DesignElementFormData[] = [
      {
        name: 'Master Bedroom',
        category: 'Bedroom',
        dimensions: {
          width: { min: 3, standard: 4 },
          length: { min: 3.5, standard: 4.5 },
        },
        area: { min: 10.5, standard: 18 },
        isSystem: true,
      },
      {
        name: 'Single Bedroom',
        category: 'Bedroom',
        dimensions: {
            width: { min: 2.7, standard: 3 },
            length: { min: 3, standard: 3.6 },
        },
        area: { min: 8.1, standard: 10.8 },
        isSystem: true,
      },
      {
        name: 'Kitchen',
        category: 'Kitchen',
        dimensions: {
            width: { min: 2.4, standard: 3 },
            length: { min: 3, standard: 4 },
        },
        area: { min: 7.2, standard: 12 },
        isSystem: true,
      },
      {
        name: 'Living Room',
        category: 'Living Room',
        dimensions: {
            width: { min: 3.5, standard: 4.5 },
            length: { min: 4, standard: 6 },
        },
        area: { min: 14, standard: 27 },
        isSystem: true,
      },
       {
        name: 'Bathroom',
        category: 'Bathroom',
        dimensions: {
            width: { min: 1.5, standard: 1.8 },
            length: { min: 2.4, standard: 2.7 },
        },
        area: { min: 3.6, standard: 4.86 },
        isSystem: true,
      }
    ];

    await DesignElement.insertMany(initialElements);
    return { success: true, message: 'Library seeded successfully' };
  } catch (error) {
    console.error('Seed failed:', error);
    return { success: false, error: 'Seed failed' };
  }
}
