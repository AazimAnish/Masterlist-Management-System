'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import ProcessStepForm from '@/components/features/process-steps/process-step-form';
import ProcessStepTable from '@/components/features/process-steps/process-step-table';
import { ProcessStepFormData } from '@/validations/process-step.schema';
import { useToast } from '@/components/ui/use-toast';
import { useProcesses } from '@/hooks/use-processes';
import { useProcessSteps } from '@/hooks/use-process-steps';

export default function ProcessStepsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { processes, isLoading: processesLoading } = useProcesses();
  const { processSteps, isLoading: stepsLoading, refetch } = useProcessSteps();

  const handleSubmit = async (data: ProcessStepFormData) => {
    try {
      setIsSubmitting(true);
      // Here you would typically make an API call to save the process step
      console.log('Submitting:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Process step has been created successfully.",
      });
      
      // Refresh the table data
      refetch();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to create process step. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (processesLoading || stepsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Process Steps" 
        description="Manage your manufacturing process steps and their sequences."
      />
      
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Process Step</h2>
          {/* @ts-expect-error Server Component */}
          <ProcessStepForm
            processes={processes}
            existingSteps={processSteps}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Process Steps List</h2>
          <ProcessStepTable data={processSteps} />
        </div>
      </div>
    </div>
  );
}
