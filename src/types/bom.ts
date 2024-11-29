import { Item } from './item';

export interface BOM {
  id?: string;
  item_id: string;
  component_id: string;
  quantity: number;
  tenant_id?: number;
  created_by?: string;
  last_updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BOMWithItems extends BOM {
  item: Item;
  component: Item;
}

export interface BOMError {
  rowIndex: number;
  field: keyof BOM;
  message: string;
}

export interface BOMFormData {
  item_id: string;
  component_id: string;
  quantity: number;
}

export interface BOMTableRow extends BOMWithItems {
  errors?: BOMError[];
  isEditing?: boolean;
}
