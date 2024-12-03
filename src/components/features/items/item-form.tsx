'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ItemFormData, ItemType, UoMType } from '@/types/item';
import { ITEM_TYPES, UOM_TYPES } from '@/constants/items';

const formSchema = z.object({
  internal_item_name: z.string().min(1, 'Internal item name is required'),
  type: z.enum(['sell', 'purchase', 'component'] as const),
  uom: z.enum(['kgs', 'nos'] as const),
  item_description: z.string().optional(),
  is_job_work: z.boolean().optional(),
  scrap_type: z.string().optional(),
});

interface ItemFormProps {
  onSubmit: (data: ItemFormData) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<ItemFormData>;
}

export function ItemForm({ onSubmit, isSubmitting = false, defaultValues }: ItemFormProps) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      internal_item_name: '',
      type: 'sell',
      uom: 'nos',
      item_description: '',
      is_job_work: false,
      scrap_type: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="internal_item_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Item Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ITEM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="uom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select UoM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UOM_TYPES.map((uom) => (
                    <SelectItem key={uom} value={uom}>
                      {uom.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Item'}
        </Button>
      </form>
    </Form>
  );
}
