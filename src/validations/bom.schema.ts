import { z } from 'zod';
import { Item } from '@/types/item';

export const bomSchema = z.object({
  item_id: z.string().min(1, 'Item is required'),
  component_id: z.string().min(1, 'Component is required'),
  quantity: z.number()
    .min(0.001, 'Quantity must be greater than 0')
    .refine((val) => Number.isInteger(val), {
      message: 'Quantity must be a whole number for items with UoM as "nos"',
    }),
}).refine((data) => {
  // Custom validation will be added here based on item types
  return true;
}, {
  message: "Invalid BOM configuration",
});

export const validateBOMEntry = (
  data: z.infer<typeof bomSchema>,
  item: Item,
  component: Item
) => {
  const errors: string[] = [];

  // Validate based on item type
  switch (item.type) {
    case 'sell':
      if (!data.item_id) {
        errors.push('Sell items must have at least one item_id entry');
      }
      break;
    case 'purchase':
      if (!data.component_id) {
        errors.push('Purchase items must have at least one component_id entry');
      }
      break;
    case 'component':
      if (!data.item_id || !data.component_id) {
        errors.push('Component items must have both item_id and component_id entries');
      }
      break;
  }

  // Validate quantity based on UoM
  if (item.uom === 'nos' && component.uom === 'nos') {
    if (!Number.isInteger(data.quantity)) {
      errors.push('Quantity must be a whole number when both items use "nos" as UoM');
    }
  }

  return errors;
};

export type BOMFormData = z.infer<typeof bomSchema>;
