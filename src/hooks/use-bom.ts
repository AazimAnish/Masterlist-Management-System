'use client';

import { useState, useEffect } from 'react';
import { BOMEntry, BOMWithDetails } from '@/types/bom';
import { BOMService } from '@/services/api/bom.service';

export function useBOM() {
  const [boms, setBoms] = useState<BOMWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadBOMs();
  }, []);

  const loadBOMs = async () => {
    try {
      setIsLoading(true);
      const data = await BOMService.getBOMs();
      setBoms(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch BOMs'));
    } finally {
      setIsLoading(false);
    }
  };

  const createBOM = async (data: Omit<BOMEntry, 'id'>) => {
    try {
      const newBOM = await BOMService.createBOM(data);
      setBoms(prevBoms => [...prevBoms, newBOM]);
      return newBOM;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create BOM'));
      throw err;
    }
  };

  const updateBOM = async (id: string, data: BOMEntry) => {
    try {
      const updatedBOM = await BOMService.updateBOM(id, data);
      setBoms(prevBoms => prevBoms.map(bom => bom.id === id ? updatedBOM : bom));
      return updatedBOM;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update BOM'));
      throw err;
    }
  };

  const deleteBOM = async (id: string) => {
    try {
      await BOMService.deleteBOM(id);
      setBoms(prevBoms => prevBoms.filter(bom => bom.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete BOM'));
      throw err;
    }
  };

  return {
    boms,
    isLoading,
    error,
    createBOM,
    updateBOM,
    deleteBOM,
    refetch: loadBOMs
  };
}
