'use client';

import { useState, useEffect } from 'react';
import { ProcessStep } from '@/types/process-step';
import { ProcessStepService } from '@/services/api/process-step.service';

export function useProcessSteps() {
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProcessSteps();
  }, []);

  const loadProcessSteps = async () => {
    try {
      setIsLoading(true);
      const data = await ProcessStepService.getProcessSteps();
      setProcessSteps(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch process steps'));
    } finally {
      setIsLoading(false);
    }
  };

  const createProcessStep = async (data: Omit<ProcessStep, 'id'>) => {
    try {
      const newStep = await ProcessStepService.createProcessStep(data);
      setProcessSteps(prevSteps => [...prevSteps, newStep]);
      return newStep;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create process step'));
      throw err;
    }
  };

  const updateProcessStep = async (id: string, data: ProcessStep) => {
    try {
      const updatedStep = await ProcessStepService.updateProcessStep(id, data);
      setProcessSteps(prevSteps => prevSteps.map(step => step.id === id ? updatedStep : step));
      return updatedStep;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update process step'));
      throw err;
    }
  };

  const deleteProcessStep = async (id: string) => {
    try {
      await ProcessStepService.deleteProcessStep(id);
      setProcessSteps(prevSteps => prevSteps.filter(step => step.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete process step'));
      throw err;
    }
  };

  return {
    processSteps,
    isLoading,
    error,
    createProcessStep,
    updateProcessStep,
    deleteProcessStep,
    refetch: loadProcessSteps
  };
}
