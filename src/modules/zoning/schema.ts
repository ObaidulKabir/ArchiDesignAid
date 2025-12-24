import { z } from 'zod';

export const zoneSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['Floor', 'Landscape', 'Podium', 'Basement', 'Zone', 'SubZone']),
  useType: z.enum(['Residential', 'Commercial', 'Retail', 'Parking', 'Office', 'Mixed', 'Circulation', 'Service', 'Other']),
  areaAllocation: z.object({
    value: z.coerce.number().positive('Area must be positive'),
    unit: z.enum(['absolute', 'percentage']),
  }),
  isOverLapping: z.boolean().default(false),
  color: z.string().optional(),
  parentId: z.string().optional(),
  projectId: z.string(),
});

export type ZoneFormData = z.infer<typeof zoneSchema>;
