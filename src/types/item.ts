export type ItemType = 'sell' | 'purchase' | 'component';
export type UoMType = 'kgs' | 'nos';

export interface Item {
  id: string;
  internal_item_name: string;
  type: ItemType;
  uom: UoMType;
  item_description?: string;
  tenant_id: number;
  created_by: string;
  last_updated_by: string;
  is_deleted: boolean;
  customer_item_name?: string;
  max_buffer?: number;
  min_buffer?: number;
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

export interface ItemFormData {
  internal_item_name: string;
  type: ItemType;
  uom: UoMType;
  tenant_id: number;
  is_job_work?: boolean;
  item_description?: string;
  customer_item_name?: string;
  max_buffer?: number;
  min_buffer?: number;
  scrap_type?: string;
  created_by: string;
  last_updated_by: string;
  is_deleted: boolean;
  additional_attributes?: {
    drawing_revision_number?: number;
    drawing_revision_date?: string;
    avg_weight_needed?: number;
    scrap_type?: string;
    shelf_floor_alternate_name?: string;
  };
}
