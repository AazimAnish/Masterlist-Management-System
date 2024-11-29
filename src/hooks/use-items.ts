import { useState, useEffect } from 'react';
import { Item } from '@/types/item';

// This is a mock API call - replace with your actual API call
const fetchItems = async (): Promise<Item[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return [
    {
      id: '1',
      internal_item_name: 'Product A',
      type: 'sell',
      uom: 'nos',
      is_job_work: false,
    },
    {
      id: '2',
      internal_item_name: 'Raw Material B',
      type: 'purchase',
      uom: 'kgs',
      is_job_work: true,
    },
    {
      id: '3',
      internal_item_name: 'Component C',
      type: 'component',
      uom: 'nos',
      is_job_work: false,
    },
  ] as Item[];
};

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const data = await fetchItems();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch items'));
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    isLoading,
    error,
    refetch,
  };
}
