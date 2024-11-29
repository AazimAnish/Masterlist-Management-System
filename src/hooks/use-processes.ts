import { useState, useEffect } from 'react';
import { Process } from '@/types/process';

// This is a mock API call - replace with your actual API call
const fetchProcesses = async (): Promise<Process[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return [
    {
      id: '1',
      name: 'Manufacturing Process A',
      type: 'manufacturing',
      work_center_id: '1',
      description: 'Main manufacturing process',
      standard_time: 120,
      status: 'active',
    },
    {
      id: '2',
      name: 'Assembly Process B',
      type: 'assembly',
      work_center_id: '2',
      description: 'Main assembly process',
      standard_time: 90,
      status: 'active',
    },
    // Add more mock data as needed
  ];
};

export function useProcesses() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProcesses = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProcesses();
        setProcesses(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch processes'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProcesses();
  }, []);

  return {
    processes,
    isLoading,
    error,
  };
}
