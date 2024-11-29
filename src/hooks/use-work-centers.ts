import { useState, useEffect } from 'react';
import { WorkCenter } from '@/types/process';

// This is a mock API call - replace with your actual API call
const fetchWorkCenters = async (): Promise<WorkCenter[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return [
    {
      id: '1',
      name: 'Assembly Line 1',
      code: 'AL001',
      description: 'Main assembly line',
      status: 'active',
    },
    {
      id: '2',
      name: 'Quality Control Station',
      code: 'QC001',
      description: 'Quality inspection area',
      status: 'active',
    },
    {
      id: '3',
      name: 'Manufacturing Cell 1',
      code: 'MC001',
      description: 'Primary manufacturing cell',
      status: 'active',
    },
  ] as WorkCenter[];
};

export function useWorkCenters() {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadWorkCenters = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWorkCenters();
        setWorkCenters(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch work centers'));
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkCenters();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWorkCenters();
      setWorkCenters(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch work centers'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workCenters,
    isLoading,
    error,
    refetch,
  };
}
