'use server';

import connectDB from '@/lib/db';
import Zone, { IZone } from './models/Zone';
import Project from '@/modules/project/models/Project';
import { zoneSchema, ZoneFormData } from './schema';
import { revalidatePath } from 'next/cache';

// Type for the tree structure
export interface ZoneNode extends Omit<IZone, keyof Document> {
  _id: string;
  children: ZoneNode[];
}

async function validateZoneArea(data: ZoneFormData, excludeZoneId?: string) {
    const project = await Project.findById(data.projectId).lean();
    if (!project) return { valid: false, message: 'Project not found' };

    // Helper to compute absolute area of a zone recursively
    const computeZoneAbsArea = async (zone: any): Promise<number> => {
        if (!zone) return 0;
        if (zone.areaAllocation.unit === 'absolute') return zone.areaAllocation.value;
        const parent =
            zone.parentId ? await Zone.findById(zone.parentId).lean() : null;
        const parentAbs =
            parent
                ? await computeZoneAbsArea(parent)
                : project.landArea.value;
        return parentAbs * (zone.areaAllocation.value / 100);
    };

    // Determine the container base area and overlapping rule (from parent container)
    let containerAbsArea = project.landArea.value;
    let isOverlappingContainer = false;
    if (data.parentId) {
        const parent = await Zone.findById(data.parentId).lean();
        if (!parent) return { valid: false, message: 'Parent zone not found' };
        containerAbsArea = await computeZoneAbsArea(parent);
        isOverlappingContainer = !!parent.isOverLapping;
    }

    // Compute absolute area of the zone being created/updated
    const currentAbs =
        data.areaAllocation.unit === 'absolute'
            ? data.areaAllocation.value
            : containerAbsArea * (data.areaAllocation.value / 100);

    // Siblings query
    const query: any = {
        projectId: data.projectId,
        parentId: data.parentId || null,
    };
    if (excludeZoneId) {
        query._id = { $ne: excludeZoneId };
    }
    const siblings = await Zone.find(query).lean();

    // Apply the same rules regardless of container type:
    // - Overlapping child: checked individually against container (not included in sum)
    // - Non-overlapping child: sum only non-overlapping siblings and ensure total <= container
    if (data.isOverLapping) {
        if (currentAbs > containerAbsArea) {
            return { valid: false, message: 'Overlapping child area exceeds container area.' };
        }
        return { valid: true };
    } else {
        let siblingsAbsSum = 0;
        for (const sib of siblings) {
            if (sib.isOverLapping) continue; // exclude overlapping siblings from sum
            const sAbs =
                sib.areaAllocation.unit === 'absolute'
                    ? sib.areaAllocation.value
                    : containerAbsArea * (sib.areaAllocation.value / 100);
            siblingsAbsSum += sAbs;
        }
        if (siblingsAbsSum + currentAbs > containerAbsArea + 1e-6) {
            const availableAbs = containerAbsArea - siblingsAbsSum;
            const availablePct = (availableAbs / containerAbsArea) * 100;
            return {
                valid: false,
                message: `Area limit exceeded for non-overlapping child. Available: ${availableAbs.toFixed(2)} sqm (${availablePct.toFixed(1)}%).`,
            };
        }
        return { valid: true };
    }
}

export async function createZone(data: ZoneFormData) {
  try {
    await connectDB();
    
    // Validation
    const validation = await validateZoneArea(data);
    if (!validation.valid) {
        return { success: false, error: validation.message };
    }

    // If parentId is provided but empty string, set it to undefined
    const payload = {
      ...data,
      parentId: data.parentId || undefined,
    };
    
    const validatedData = zoneSchema.parse(payload);
    
    const zone = await Zone.create(validatedData);
    
    revalidatePath(`/projects/${data.projectId}`);
    return { success: true, id: zone._id.toString() };
  } catch (error) {
    console.error('Failed to create zone:', error);
    return { success: false, error: 'Failed to create zone' };
  }
}

export async function updateZone(id: string, data: ZoneFormData) {
    try {
        await connectDB();
        
        const existingZone = await Zone.findById(id);
        if (!existingZone) return { success: false, error: 'Zone not found' };

        // Validation
        const validation = await validateZoneArea(data, id);
        if (!validation.valid) {
            return { success: false, error: validation.message };
        }

        const payload = {
            ...data,
            parentId: data.parentId || undefined,
        };

        const validatedData = zoneSchema.parse(payload);

        await Zone.findByIdAndUpdate(id, validatedData);
        
        revalidatePath(`/projects/${data.projectId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update zone:', error);
        return { success: false, error: 'Failed to update zone' };
    }
}


export async function getZonesByProject(projectId: string) {
  try {
    await connectDB();
    const zones = await Zone.find({ projectId }).sort({ order: 1, createdAt: 1 }).lean();
    
    // Serialize
    const serializedZones = zones.map(z => ({
      ...z,
      _id: z._id.toString(),
      projectId: z.projectId.toString(),
      parentId: z.parentId?.toString(),
      createdAt: z.createdAt?.toISOString(),
      updatedAt: z.updatedAt?.toISOString(),
      children: [] as any[],
    }));

    // Build Tree
    const zoneMap = new Map<string, any>();
    serializedZones.forEach(z => zoneMap.set(z._id, z));
    
    const rootZones: any[] = [];
    
    serializedZones.forEach(z => {
      if (z.parentId && zoneMap.has(z.parentId)) {
        const parent = zoneMap.get(z.parentId);
        parent.children.push(z);
      } else {
        rootZones.push(z);
      }
    });

    return rootZones;
  } catch (error) {
    console.error('Failed to fetch zones:', error);
    return [];
  }
}

export async function getZoneById(id: string) {
    try {
        await connectDB();
        const zone = await Zone.findById(id).lean();
        if (!zone) return null;
        
        return {
            ...zone,
            _id: zone._id.toString(),
            projectId: zone.projectId.toString(),
            parentId: zone.parentId?.toString(),
            createdAt: zone.createdAt?.toISOString(),
            updatedAt: zone.updatedAt?.toISOString(),
        };
    } catch (error) {
        console.error('Failed to fetch zone:', error);
        return null;
    }
}

export async function deleteZone(id: string, projectId: string) {
  try {
    await connectDB();
    
    // Recursive delete would be better, but for now simple delete
    // We should probably check if it has children first
    const hasChildren = await Zone.exists({ parentId: id });
    if (hasChildren) {
        return { success: false, error: 'Cannot delete zone with children. Remove sub-zones first.' };
    }

    await Zone.findByIdAndDelete(id);
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete zone:', error);
    return { success: false, error: 'Failed to delete zone' };
  }
}

export async function getChildZones(parentId: string) {
  try {
    await connectDB();
    const zones = await Zone.find({ parentId }).sort({ order: 1, createdAt: 1 }).lean();
    return zones.map(z => ({
      ...z,
      _id: z._id.toString(),
      projectId: z.projectId.toString(),
      parentId: z.parentId?.toString(),
      createdAt: z.createdAt?.toISOString(),
      updatedAt: z.updatedAt?.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch child zones:', error);
    return [];
  }
}
