import { z } from 'zod';
import { StepType, StepStatus } from '@/types/process-step';

export const processStepSchema = z.object({
  process_id: z.string().min(1, 'Process is required'),
  name: z.string()
    .min(1, 'Step name is required')
    .max(100, 'Step name must be less than 100 characters'),
  step_number: z.number()
    .min(1, 'Step number must be greater than 0')
    .int('Step number must be a whole number'),
  type: z.enum(['operation', 'inspection', 'transport', 'delay', 'storage'] as const, {
    required_error: 'Step type is required',
    invalid_type_error: 'Invalid step type selected',
  }),
  description: z.string().optional(),
  standard_time: z.number()
    .min(0, 'Standard time cannot be negative')
    .optional(),
  status: z.enum(['active', 'inactive'] as const)
    .default('active'),
  is_mandatory: z.boolean().default(true),
  predecessor_ids: z.array(z.string()).optional(),
}).refine((data) => {
  // Add custom validation logic here if needed
  return true;
}, {
  message: "Invalid process step configuration",
});

export type ProcessStepFormData = z.infer<typeof processStepSchema>;
