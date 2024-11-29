'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ItemForm } from '@/components/features/items/item-form';
import { ItemsTable } from '@/components/features/items/items-table';
import { ItemFormData } from '@/validations/item.schema';
import { useToast } from '@/components/ui/use-toast';

export default function ItemsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const handleSubmit = async (data: ItemFormData) => {
    try {
      setIsSubmitting(true);
      // Here you would typically make an API call to save the item
      console.log('Submitting:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Item has been created successfully.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Items" 
        description="Manage your inventory items and their properties."
      />
      
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          <ItemForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Items List</h2>
          <ItemsTable />
        </div>
      </div>
    </div>
  );
}
