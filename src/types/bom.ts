import { Item } from './item';
import { z } from 'zod';

// CSV Row Schema with strict typing
export const csvBOMSchema = z.object({
  item_id: z.string().min(1, 'Item ID is required'),
  component_id: z.string().min(1, 'Component ID is required'), 
  quantity: z.coerce
    .number()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity must not exceed 100'),
});

export type CSVBOMRow = z.infer<typeof csvBOMSchema>;

export interface BOMEntry {
  id?: string;
  item_id: string;
  component_id: string;
  quantity: number;
  uom: string;
  scrap_percentage?: number;
  notes?: string;
  is_active: boolean;
  created_by: string;
  last_updated_by: string;
  createdAt: string;
  updatedAt: string;
}

export interface BOMWithDetails extends BOMEntry {
  item: {
    internal_item_name: string;
    type: string;
  };
  component: {
    internal_item_name: string;
    type: string;
  };
}

export interface CSVValidationError {
  row: number;
  message: string;
  data: any;
}

export interface BOMError {
  rowIndex: number;
  field: keyof BOMEntry;
  message: string;
}

export interface BOMFormData {
  item_id: string;
  component_id: string;
  quantity: number;
  uom: string;
  scrap_percentage?: number;
  notes?: string;
  is_active: boolean;
}

export interface BOMTableRow extends BOMWithDetails {
  errors?: BOMError[];
  isEditing?: boolean;
}
