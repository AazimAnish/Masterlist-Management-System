import { useEffect, useState } from 'react';
import { PendingItemsByType } from '@/types/pending';
import { useSetupStore } from '@/stores/useSetupStore';

export function usePendingItems() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState<PendingItemsByType>({
    items: [],
    processes: [],
    bom: [],
    processSteps: [],
  });

  const progress = useSetupStore((state) => state.progress);

  useEffect(() => {
    // This is where you would typically fetch pending items from your API
    // For now, we'll generate them based on progress
    const newPendingItems: PendingItemsByType = {
      items: progress.items < 100 ? [
        {
          id: '1',
          title: 'Complete Item Setup',
          type: 'items',
          description: 'Add required item information including UoM and type',
          path: '/items',
        }
      ] : [],
      processes: progress.processes < 100 ? [
        {
          id: '2',
          title: 'Define Processes',
          type: 'processes',
          description: 'Set up manufacturing processes',
          dependencies: progress.items < 100 ? ['Items'] : undefined,
          path: '/processes',
        }
      ] : [],
      bom: progress.bom < 100 ? [
        {
          id: '3',
          title: 'Create Bill of Materials',
          type: 'bom',
          description: 'Define item relationships and quantities',
          dependencies: progress.items < 100 ? ['Items'] : undefined,
          path: '/bom',
        }
      ] : [],
      processSteps: progress.processSteps < 100 ? [
        {
          id: '4',
          title: 'Configure Process Steps',
          type: 'processSteps',
          description: 'Set up manufacturing process steps',
          dependencies: 
            progress.processes < 100 ? ['Processes'] : 
            progress.items < 100 ? ['Items'] : undefined,
          path: '/process-steps',
        }
      ] : [],
    };

    setPendingItems(newPendingItems);
    setIsLoading(false);
  }, [progress]);

  return { pendingItems, isLoading };
}
