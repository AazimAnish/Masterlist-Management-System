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
  FormDescription,
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
  min_buffer: z.coerce.number().default(0),
  max_buffer: z.coerce.number().default(0),
  additional_attributes: z.object({
    avg_weight_needed: z.boolean().default(false),
    scrap_type: z.string().optional(),
  }),
  tenant_id: z.coerce.number().default(1),
});

interface ItemFormProps {
  onSubmit: (data: ItemFormData) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<ItemFormData>;
}

export function ItemForm({ onSubmit, isSubmitting = false, defaultValues }: ItemFormProps) {
  const form = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      internal_item_name: '',
      type: 'sell',
      uom: 'nos',
      item_description: '',
      min_buffer: 0,
      max_buffer: 0,
      tenant_id: 1,
      is_deleted: false,
      created_by: 'system_user',
      last_updated_by: 'system_user',
      additional_attributes: {
        avg_weight_needed: false,
        scrap_type: '',
      },
      ...defaultValues,
    },
  });

  const watchType = form.watch('type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="internal_item_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Item Name *</FormLabel>
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
              <FormLabel>Type *</FormLabel>
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
              <FormLabel>Unit of Measurement *</FormLabel>
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

        <FormField
          control={form.control}
          name="additional_attributes.avg_weight_needed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Average Weight Needed *</FormLabel>
                <FormDescription>
                  Check if average weight is needed for this item
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {watchType === 'sell' && (
          <FormField
            control={form.control}
            name="additional_attributes.scrap_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scrap Type *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter scrap type" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="min_buffer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Buffer {(watchType === 'sell' || watchType === 'purchase') && '*'}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_buffer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Buffer</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="item_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tenant_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tenant ID *</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
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
