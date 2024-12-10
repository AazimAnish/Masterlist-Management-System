import { z } from 'zod';
import { ITEM_TYPES, UOM_TYPES } from '@/constants/items';

export const itemSchema = z.object({
  internal_item_name: z.string()
    .min(1, 'Internal item name is required')
    .max(100, 'Item name must be less than 100 characters'),
  
  type: z.enum(ITEM_TYPES, {
    required_error: 'Type is required',
    invalid_type_error: 'Invalid type selected',
  }),
  
  uom: z.enum(UOM_TYPES, {
    required_error: 'Unit of Measure is required',
    invalid_type_error: 'Invalid UoM selected',
  }),

  min_buffer: z.number().nullable()
    .refine((val) => {
      return val !== null;
    }, {
      message: 'Min buffer is required for Sell and Purchase items',
      path: ['min_buffer']
    }),

  max_buffer: z.number().nullable()
    .refine((val) => {
      return val === null || val >= 0;
    }, {
      message: 'Max buffer must be greater than or equal to Min buffer',
      path: ['max_buffer'] 
    }),

  additional_attributes: z.object({
    avg_weight_needed: z.boolean({
      required_error: 'Average weight needed is required',
    }),
    scrap_type: z.string().optional()
      .refine((val) => {
        return val !== undefined && val !== '';
      }, {
        message: 'Scrap type is required for Sell items',
        path: ['scrap_type']
      }),
  }).required(),
});

export type ItemFormData = z.infer<typeof itemSchema>;
