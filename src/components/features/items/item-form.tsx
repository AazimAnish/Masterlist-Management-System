'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemSchema, type ItemFormData } from '@/validations/item.schema';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/item';

const typeOptions = [
  { 
    value: 'sell', 
    label: 'Sell', 
    tooltip: 'Items that are sold to customers' 
  },
  { 
    value: 'purchase', 
    label: 'Purchase', 
    tooltip: 'Items that are purchased from vendors' 
  },
  { 
    value: 'component', 
    label: 'Component', 
    tooltip: 'Items used in manufacturing' 
  },
];

const uomOptions = [
  { 
    value: 'kgs', 
    label: 'Kilograms', 
    tooltip: 'Weight-based measurement' 
  },
  { 
    value: 'nos', 
    label: 'Numbers', 
    tooltip: 'Quantity-based measurement' 
  },
];

interface ItemFormProps {
  initialData?: Item;
  onSubmit: (data: ItemFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ItemForm({ 
  initialData, 
  onSubmit,
  isSubmitting: externalIsSubmitting 
}: ItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    setValue,
    watch,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: initialData,
  });

  const type = watch('type');
  const isSubmitting = externalIsSubmitting || formIsSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            {...register('internal_item_name')}
            label="Internal Item Name"
            error={errors.internal_item_name?.message}
            placeholder="Enter item name"
          />
        </div>

        <div>
          <SearchableSelect
            label="Type"
            options={typeOptions}
            value={type}
            onChange={(value) => setValue('type', value as ItemFormData['type'])}
            error={errors.type?.message}
          />
        </div>

        <div>
          <SearchableSelect
            label="Unit of Measure"
            options={uomOptions}
            value={watch('uom')}
            onChange={(value) => setValue('uom', value as ItemFormData['uom'])}
            error={errors.uom?.message}
          />
        </div>

        {(type === 'sell' || type === 'purchase') && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_job_work"
              checked={watch('is_job_work')}
              onCheckedChange={(checked) => 
                setValue('is_job_work', checked as boolean)
              }
            />
            <label 
              htmlFor="is_job_work"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Is Job Work
            </label>
          </div>
        )}
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
          {isSubmitting ? 'Saving...' : 'Save Item'}
        </Button>
      </div>
    </form>
  );
}
