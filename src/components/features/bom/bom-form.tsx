'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bomSchema, type BOMFormData } from '@/validations/bom.schema';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/item';
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface BOMFormProps {
  items: Item[];
  onSubmit: (data: BOMFormData) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: BOMFormData;
}

export function BOMForm({
  items,
  onSubmit,
  isSubmitting: externalIsSubmitting,
  initialData,
}: BOMFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<BOMFormData>({
    resolver: zodResolver(bomSchema),
    defaultValues: initialData,
  });

  const item_id = watch('item_id');
  const component_id = watch('component_id');
  const isSubmitting = externalIsSubmitting || formIsSubmitting;

  const selectedItem = items.find(item => item.id === item_id);
  const selectedComponent = items.find(item => item.id === component_id);

  // Filter items based on type
  const itemOptions = items
    .filter(item => ['sell', 'component'].includes(item.type))
    .map(item => ({
      value: item.id!,
      label: item.internal_item_name,
      tooltip: `Type: ${item.type}, UoM: ${item.uom}`,
    }));

  const componentOptions = items
    .filter(item => ['purchase', 'component'].includes(item.type))
    .map(item => ({
      value: item.id!,
      label: item.internal_item_name,
      tooltip: `Type: ${item.type}, UoM: ${item.uom}`,
    }));

  // Validate quantity based on UoM changes
  useEffect(() => {
    if (selectedItem && selectedComponent) {
      trigger('quantity');
    }
  }, [selectedItem, selectedComponent, trigger]);

  const handleFormSubmit = async (data: BOMFormData) => {
    if (!selectedItem || !selectedComponent) {
      toast({
        title: "Error",
        description: "Please select both item and component",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <SearchableSelect
            label="Item"
            options={itemOptions}
            value={item_id}
            onChange={(value) => setValue('item_id', value)}
            error={errors.item_id?.message}
          />
        </div>

        <div>
          <SearchableSelect
            label="Component"
            options={componentOptions}
            value={component_id}
            onChange={(value) => setValue('component_id', value)}
            error={errors.component_id?.message}
          />
        </div>

        <div>
          <Input
            type="number"
            label="Quantity"
            step={selectedItem?.uom === 'nos' && selectedComponent?.uom === 'nos' ? 1 : 0.001}
            {...register('quantity', { valueAsNumber: true })}
            error={errors.quantity?.message}
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
          {isSubmitting ? 'Saving...' : 'Save BOM'}
        </Button>
      </div>
    </form>
  );
}
