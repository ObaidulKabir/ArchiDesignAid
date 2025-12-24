'use server';

import connectDB from '@/lib/db';
import ZoneLayout, { IZoneLayout } from '../zoning/models/ZoneLayout';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { z } from 'zod';

export async function saveZoneLayout(zoneId: string, elements: any[], container?: { width: number; length: number }, childZones?: any[], unit?: 'metric' | 'imperial') {
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
        ...(unit ? { unit } : {}),
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

const LayoutPayloadSchema = z.object({
  unit: z.union([z.literal('metric'), z.literal('imperial')]).optional(),
  container: z
    .object({
      width: z.number().positive(),
      length: z.number().positive(),
    })
    .optional(),
  elements: z
    .array(
      z.object({
        elementId: z.string(),
        instanceId: z.string(),
        name: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number().positive(),
        length: z.number().positive(),
        rotation: z.number(),
        color: z.string().optional(),
      })
    )
    .default([]),
  childZones: z
    .array(
      z.object({
        zoneId: z.string(),
        name: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number().positive(),
        length: z.number().positive(),
        isOverLapping: z.boolean().optional(),
      })
    )
    .default([]),
});

export async function updateZoneLayout(zoneId: string, payload: unknown) {
  try {
    await connectDB();
    const data = LayoutPayloadSchema.parse(payload);

    const formattedElements = data.elements.map((el) => ({
      elementId: new mongoose.Types.ObjectId(el.elementId),
      instanceId: el.instanceId,
      name: el.name,
      position: { x: el.x, y: el.y, z: 0 },
      rotation: el.rotation,
      dimensions: { width: el.width, length: el.length },
      properties: el.color ? { color: el.color } : undefined,
    }));

    const formattedChildZones = data.childZones.map((cz) => ({
      zoneId: new mongoose.Types.ObjectId(cz.zoneId),
      name: cz.name,
      x: cz.x,
      y: cz.y,
      width: cz.width,
      length: cz.length,
      isOverLapping: !!cz.isOverLapping,
    }));

    await ZoneLayout.findOneAndUpdate(
      { zoneId: new mongoose.Types.ObjectId(zoneId) },
      {
        zoneId: new mongoose.Types.ObjectId(zoneId),
        elements: formattedElements,
        childZones: formattedChildZones,
        ...(data.container ? { container: data.container } : {}),
        ...(data.unit ? { unit: data.unit } : {}),
        $inc: { version: 1 },
      },
      { upsert: true, new: true }
    );

    revalidatePath(`/projects/[id]/planner/${zoneId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update layout:', error);
    return { success: false, error: 'Failed to update layout' };
  }
}

export async function getZoneLayout(zoneId: string) {
  try {
    await connectDB();
    const layout = await ZoneLayout.findOne({ zoneId }).lean();
    
    if (!layout) return null;

    return {
      _id: layout._id.toString(),
      zoneId: layout.zoneId.toString(),
      unit: (layout as any).unit || 'metric',
      version: (layout as any).version ?? 1,
      createdAt: layout.createdAt ? layout.createdAt.toISOString() : undefined,
      updatedAt: layout.updatedAt ? layout.updatedAt.toISOString() : undefined,
      container: layout.container
        ? { width: layout.container.width, length: layout.container.length }
        : undefined,
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
        color: el.properties?.color,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch layout:', error);
    return null;
  }
}
