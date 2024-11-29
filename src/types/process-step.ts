import { Process } from './process';

export type StepType = 'operation' | 'inspection' | 'transport' | 'delay' | 'storage';
export type StepStatus = 'active' | 'inactive';

export interface ProcessStep {
  id?: string;
  process_id: string;
  name: string;
  step_number: number;
  type: StepType;
  description?: string;
  standard_time?: number; // in minutes
  status: StepStatus;
  is_mandatory: boolean;
  predecessor_ids?: string[]; // IDs of steps that must be completed before this one
  tenant_id?: number;
  created_by?: string;
  last_updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcessStepWithProcess extends ProcessStep {
  process: Process;
}

export interface ProcessStepError {
  rowIndex: number;
  field: keyof ProcessStep;
  message: string;
}

export interface ProcessStepTableRow extends ProcessStepWithProcess {
  errors?: ProcessStepError[];
  isEditing?: boolean;
}
