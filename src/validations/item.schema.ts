import { z } from 'zod';
import { ItemType, UnitOfMeasure } from '@/types/item';

export const itemSchema = z.object({
  internal_item_name: z.string()
    .min(1, 'Item name is required')
    .max(100, 'Item name must be less than 100 characters'),
  type: z.enum(['sell', 'purchase', 'component'] as const, {
    required_error: 'Type is required',
    invalid_type_error: 'Invalid type selected',
  }),
  uom: z.enum(['kgs', 'nos'] as const, {
    required_error: 'Unit of Measure is required',
    invalid_type_error: 'Invalid UoM selected',
  }),
  is_job_work: z.boolean().optional(),
  scrap_type: z.string().optional(),
});

export type ItemFormData = z.infer<typeof itemSchema>;
