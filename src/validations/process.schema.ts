import { z } from 'zod';
import { ProcessType, ProcessStatus } from '@/types/process';

export const processSchema = z.object({
  name: z.string()
    .min(1, 'Process name is required')
    .max(100, 'Process name must be less than 100 characters'),
  type: z.enum(['manufacturing', 'assembly', 'quality_check'] as const, {
    required_error: 'Process type is required',
    invalid_type_error: 'Invalid process type selected',
  }),
  description: z.string().optional(),
  work_center_id: z.string().min(1, 'Work center is required'),
  standard_time: z.number()
    .min(0, 'Standard time cannot be negative')
    .optional(),
  status: z.enum(['active', 'inactive'] as const)
    .default('active'),
});

export const workCenterSchema = z.object({
  name: z.string()
    .min(1, 'Work center name is required')
    .max(100, 'Work center name must be less than 100 characters'),
  code: z.string()
    .min(1, 'Work center code is required')
    .max(20, 'Work center code must be less than 20 characters'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive'] as const)
    .default('active'),
});

export type ProcessFormData = z.infer<typeof processSchema>;
export type WorkCenterFormData = z.infer<typeof workCenterSchema>;
