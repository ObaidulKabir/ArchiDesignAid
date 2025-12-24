'use server';

import connectDB from '@/lib/db';
import ZoneLayout, { IZoneLayout } from '../zoning/models/ZoneLayout';
import { revalidatePath } from 'next/cache';

export async function saveZoneLayout(zoneId: string, elements: any[], container?: { width: number; length: number }, childZones?: any[]) {
  try {
    await connectDB();

    // Transform UI elements to DB schema format
    const formattedElements = elements.map(el => ({
      elementId: el.elementId,
      instanceId: el.instanceId,
      name: el.name,
      position: { x: el.x, y: el.y, z: 0 },
      rotation: el.rotation,
      dimensions: {
        width: el.width,
        length: el.length,
      },
      properties: {
        color: el.color
      }
    }));

    await ZoneLayout.findOneAndUpdate(
      { zoneId },
      { 
        zoneId, 
        elements: formattedElements,
        ...(container ? { container } : {}),
        ...(childZones ? { childZones } : {}),
        $inc: { version: 1 } 
      },
      { upsert: true, new: true }
    );

    revalidatePath(`/projects/[id]/planner/${zoneId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to save layout:', error);
    return { success: false, error: 'Failed to save layout' };
  }
}

export async function getZoneLayout(zoneId: string) {
  try {
    await connectDB();
    const layout = await ZoneLayout.findOne({ zoneId }).lean();
    
    if (!layout) return null;

    // Transform back to UI format
    return {
        ...layout,
        _id: layout._id.toString(),
        container: layout.container ? { width: layout.container.width, length: layout.container.length } : undefined,
        childZones: layout.childZones
          ? layout.childZones.map((cz: any) => ({
              zoneId: cz.zoneId.toString(),
              name: cz.name,
              x: cz.x,
              y: cz.y,
              width: cz.width,
              length: cz.length,
              isOverLapping: cz.isOverLapping,
            }))
          : undefined,
        elements: layout.elements.map((el: any) => ({
            instanceId: el.instanceId,
            elementId: el.elementId.toString(),
            name: el.name,
            x: el.position.x,
            y: el.position.y,
            width: el.dimensions.width,
            length: el.dimensions.length,
            rotation: el.rotation,
            color: el.properties?.color
        }))
    };
  } catch (error) {
    console.error('Failed to fetch layout:', error);
    return null;
  }
}
