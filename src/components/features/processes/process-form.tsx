'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { processSchema, type ProcessFormData } from '@/validations/process.schema';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { WorkCenter } from '@/types/process';

const processTypeOptions = [
  { 
    value: 'manufacturing', 
    label: 'Manufacturing',
    tooltip: 'Production processes that transform raw materials' 
  },
  { 
    value: 'assembly', 
    label: 'Assembly',
    tooltip: 'Processes that combine components' 
  },
  { 
    value: 'quality_check', 
    label: 'Quality Check',
    tooltip: 'Quality control and inspection processes' 
  },
];

interface ProcessFormProps {
  workCenters: WorkCenter[];
  onSubmit: (data: ProcessFormData) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: ProcessFormData;
}

export function ProcessForm({
  workCenters,
  onSubmit,
  isSubmitting: externalIsSubmitting,
  initialData,
}: ProcessFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    setValue,
    watch,
  } = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
    defaultValues: initialData,
  });

  const isSubmitting = externalIsSubmitting || formIsSubmitting;

  const workCenterOptions = workCenters
    .filter(wc => wc.status === 'active')
    .map(wc => ({
      value: wc.id!,
      label: wc.name,
      tooltip: `Code: ${wc.code}`,
    }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Process Name"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div>
          <SearchableSelect
            label="Process Type"
            options={processTypeOptions}
            value={watch('type')}
            onChange={(value) => setValue('type', value as ProcessFormData['type'])}
            error={errors.type?.message}
          />
        </div>

        <div>
          <SearchableSelect
            label="Work Center"
            options={workCenterOptions}
            value={watch('work_center_id')}
            onChange={(value) => setValue('work_center_id', value)}
            error={errors.work_center_id?.message}
          />
        </div>

        <div>
          <Input
            type="number"
            label="Standard Time (minutes)"
            {...register('standard_time', { valueAsNumber: true })}
            error={errors.standard_time?.message}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Description"
            {...register('description')}
            error={errors.description?.message}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Process'}
        </Button>
      </div>
    </form>
  );
}
