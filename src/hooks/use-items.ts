'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/types/item';
import { ItemsService } from '@/services/api/items.service';
import { useToast } from '@/components/ui/use-toast';

interface UseItemsResult {
  items: Item[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useItems(): UseItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const data = await ItemsService.getItems();
      setItems(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch items');
      setError(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    isLoading,
    error,
    refetch: loadItems,
  };
}
