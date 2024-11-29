'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { BOMForm } from '@/components/features/bom/bom-form';
import { BOMTable } from '@/components/features/bom/bom-table';
import { BOMFormData } from '@/validations/bom.schema';
import { toast, useToast } from '@/components/ui/use-toast';
import { useItems } from '@/hooks/use-items'; // You'll need to create this hook

export default function BOMPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, isLoading } = useItems(); // Custom hook to fetch items

  const handleSubmit = async (data: BOMFormData) => {
    try {
      setIsSubmitting(true);
      // Here you would typically make an API call to save the BOM
      console.log('Submitting:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "BOM has been created successfully.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create BOM. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Bill of Materials" 
        description="Manage your product compositions and material requirements."
      />
      
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New BOM</h2>
          <BOMForm 
            items={items}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">BOM List</h2>
          <BOMTable data={[]} /> {/* Pass your BOM data here */}
        </div>
      </div>
    </div>
  );
}
