'use client';

import { useState, useEffect } from 'react';
import { Process } from '@/types/process';
import { ProcessService } from '@/services/api/process.service';

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
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      setIsLoading(true);
      const data = await ProcessService.getProcesses();
      setProcesses(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch processes'));
    } finally {
      setIsLoading(false);
    }
  };

  const createProcess = async (data: Omit<Process, 'id'>) => {
    try {
      const newProcess = await ProcessService.createProcess(data);
      setProcesses(prevProcesses => [...prevProcesses, newProcess]);
      return newProcess;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create process'));
      throw err;
    }
  };

  const updateProcess = async (id: string, data: Process) => {
    try {
      const updatedProcess = await ProcessService.updateProcess(id, data);
      setProcesses(prevProcesses => prevProcesses.map(process => process.id === id ? updatedProcess : process));
      return updatedProcess;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update process'));
      throw err;
    }
  };

  const deleteProcess = async (id: string) => {
    try {
      await ProcessService.deleteProcess(id);
      setProcesses(prevProcesses => prevProcesses.filter(process => process.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete process'));
      throw err;
    }
  };

  return {
    processes,
    isLoading,
    error,
    createProcess,
    updateProcess,
    deleteProcess,
    refetch: loadProcesses
  };
}
