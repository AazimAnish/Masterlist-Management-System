import { Item } from './item';

export interface BOMEntry {
  id?: string;
  item_id: string;
  component_id: string;
  quantity: number;
  uom: string;
  scrap_percentage?: number;
  notes?: string;
  is_active: boolean;
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
