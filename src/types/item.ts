export interface Item {
  id: string;
  internal_item_name: string;
  tenant_id: number;
  item_description?: string;
  uom: 'kgs' | 'nos';
  created_by: string;
  last_updated_by: string;
  type: 'sell' | 'purchase' | 'component';
  max_buffer?: number;
  min_buffer?: number;
  customer_item_name?: string;
  is_deleted: boolean;
  is_job_work?: boolean;
  createdAt: string;
  updatedAt: string;
  additional_attributes?: {
    drawing_revision_number?: number;
    drawing_revision_date?: string;
    avg_weight_needed?: number;
    scrap_type?: string;
    shelf_floor_alternate_name?: string;
  };
}

export type PartialItem = Partial<Item>;

export interface ItemFormData {
  internal_item_name: string;
  type: 'sell' | 'purchase' | 'component';
  uom: 'kgs' | 'nos';
  item_description?: string;
  customer_item_name?: string;
  max_buffer?: number;
  min_buffer?: number;
  tenant_id?: number;
  is_job_work?: boolean;
  additional_attributes?: {
    drawing_revision_number?: number;
    drawing_revision_date?: string;
    avg_weight_needed?: number;
    scrap_type?: string;
    shelf_floor_alternate_name?: string;
  };
}

export interface ItemError {
  field: string;
  message: string;
  row?: number;
}

export interface ItemTableRow extends Item {
  errors?: ItemError[];
  isEditing?: boolean;
}

export type ItemValidationResult = {
  isValid: boolean;
  errors: ItemError[];
};
