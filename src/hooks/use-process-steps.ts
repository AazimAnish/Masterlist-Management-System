import { useState, useEffect } from 'react';
import { ProcessStepWithProcess } from '@/types/process-step';

// This is a mock API call - replace with your actual API call
const fetchProcessSteps = async (): Promise<ProcessStepWithProcess[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return [
    {
      id: '1',
      process_id: '1',
      name: 'Material Preparation',
      step_number: 1,
      type: 'operation',
      description: 'Prepare raw materials for processing',
      standard_time: 30,
      status: 'active',
      is_mandatory: true,
      process: {
        id: '1',
        name: 'Manufacturing Process A',
        type: 'manufacturing',
        work_center_id: '1',
        status: 'active',
      },
    },
    {
      id: '2',
      process_id: '1',
      name: 'Quality Check',
      step_number: 2,
      type: 'inspection',
      description: 'Inspect prepared materials',
      standard_time: 15,
      status: 'active',
      is_mandatory: true,
      process: {
        id: '1',
        name: 'Manufacturing Process A',
        type: 'manufacturing',
        work_center_id: '1',
        status: 'active',
      },
    },
    // Add more mock data as needed
  ];
};

export function useProcessSteps() {
  const [processSteps, setProcessSteps] = useState<ProcessStepWithProcess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchProcessSteps();
      setProcessSteps(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch process steps'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    processSteps,
    isLoading,
    error,
    refetch: fetchData,
  };
}
