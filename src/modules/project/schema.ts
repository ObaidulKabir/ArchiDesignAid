import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  location: z.object({
    address: z.string().min(5, 'Address must be at least 5 characters'),
    // coordinates: z.object({
    //   lat: z.coerce.number().optional(),
    //   lng: z.coerce.number().optional(),
    // }).optional(),
  }),
  landArea: z.object({
    value: z.coerce.number().positive('Land area must be positive'),
    unit: z.enum(['sqm', 'sqft', 'acre', 'hectare']),
  }),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
