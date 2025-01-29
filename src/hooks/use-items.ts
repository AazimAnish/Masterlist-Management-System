'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/types/item';
import { ItemService } from '@/services/api/item.service';
import { useToast } from '@/components/ui/use-toast';

interface UseItemsResult {
  items: Item[];
  isLoading: boolean;
  error: Error | null;
  createItem: (data: Omit<Item, 'id'>) => Promise<Item>;
  updateItem: (id: string, data: Item) => Promise<Item>;
  deleteItem: (id: string) => Promise<void>;
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
      const data = await ItemService.getItems();
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

  const createItem = async (data: Omit<Item, 'id'>) => {
    try {
      const newItem = await ItemService.createItem(data);
      setItems(prevItems => [...prevItems, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create item'));
      throw err;
    }
  };

  const updateItem = async (id: string, data: Item) => {
    try {
      const updatedItem = await ItemService.updateItem(id, data);
      setItems(prevItems => prevItems.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update item'));
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await ItemService.deleteItem(id);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete item'));
      throw err;
    }
  };

  return {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch: loadItems,
  };
}
