import { Item } from './item';

export type ProcessType = 'manufacturing' | 'assembly' | 'quality_check';
export type ProcessStatus = 'active' | 'inactive';

export interface Process {
  id?: string;
  name: string;
  type: ProcessType;
  description?: string;
  work_center_id: string;
  standard_time?: number; // in minutes
  status: ProcessStatus;
  tenant_id?: number;
  created_by?: string;
  last_updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkCenter {
  id?: string;
  name: string;
  code: string;
  description?: string;
  status: ProcessStatus;
  tenant_id?: number;
  created_by?: string;
  last_updated_by?: string;
}

export interface ProcessWithWorkCenter extends Process {
  work_center: WorkCenter;
}

export interface ProcessError {
  rowIndex: number;
  field: keyof Process;
  message: string;
}

export interface ProcessTableRow extends ProcessWithWorkCenter {
  errors?: ProcessError[];
  isEditing?: boolean;
}
