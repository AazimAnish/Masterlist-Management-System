import { z } from 'zod';

export const bomSchema = z.object({
  item_id: z.string().min(1, 'Item ID is required'),
  component_id: z.string().min(1, 'Component ID is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  uom: z.string().min(1, 'UoM is required'),
  scrap_percentage: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  is_active: z.coerce.boolean().default(true),
});

export type BOMFormData = z.infer<typeof bomSchema>;
