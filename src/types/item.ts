export type ItemType = 'sell' | 'purchase' | 'component';
export type UnitOfMeasure = 'kgs' | 'nos';

export interface Item {
  id?: string;
  internal_item_name: string;
  type: ItemType;
  uom: UnitOfMeasure;
  is_job_work?: boolean;
  scrap_type?: string;
  tenant_id?: number;
  created_by?: string;
  last_updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemError {
  rowIndex: number;
  field: keyof Item;
  message: string;
}

export interface ItemTableRow extends Item {
  errors?: ItemError[];
  isEditing?: boolean;
}
