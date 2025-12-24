import { z } from 'zod';

export const designElementSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Balcony', 'Staircase', 'Lift', 'Corridor', 'Furniture', 'Other']),
  description: z.string().optional(),
  dimensions: z.object({
    width: z.object({
      min: z.coerce.number().optional(),
      max: z.coerce.number().optional(),
      standard: z.coerce.number(),
    }),
    length: z.object({
      min: z.coerce.number().optional(),
      max: z.coerce.number().optional(),
      standard: z.coerce.number(),
    }),
    height: z.object({
      min: z.coerce.number().optional(),
      max: z.coerce.number().optional(),
      standard: z.coerce.number(),
    }).optional(),
  }),
  area: z.object({
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
    standard: z.coerce.number(),
  }),
  isSystem: z.boolean().default(false),
});

export type DesignElementFormData = z.infer<typeof designElementSchema>;
