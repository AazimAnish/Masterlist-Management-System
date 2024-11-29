'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ProcessForm } from '@/components/features/processes/process-form';
import { ProcessTable } from '@/components/features/processes/process-table';
import { ProcessFormData } from '@/validations/process.schema';
import { useToast } from '@/components/ui/use-toast';
import { useWorkCenters } from '@/hooks/use-work-centers';

export default function ProcessesPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { workCenters, isLoading } = useWorkCenters();

  const handleSubmit = async (data: ProcessFormData) => {
    try {
      setIsSubmitting(true);
      // Here you would typically make an API call to save the process
      console.log('Submitting:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Process has been created successfully.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create process. Please try again.",
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
        title="Processes" 
        description="Manage your manufacturing processes and work centers."
      />
      
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Process</h2>
          <ProcessForm 
            workCenters={workCenters}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Processes List</h2>
          <ProcessTable data={[]} />
        </div>
      </div>
    </div>
  );
}
