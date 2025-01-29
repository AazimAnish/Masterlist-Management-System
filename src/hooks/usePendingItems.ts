'use client';

import { useState, useEffect } from 'react';
import { PendingItemsByType } from '@/types/pending';
import { useSetupStore } from '@/stores/useSetupStore';
import { useItems } from '@/hooks/use-items';
import { useBOM } from '@/hooks/use-bom';
import { useProcesses } from '@/hooks/use-processes';
import { useProcessSteps } from '@/hooks/use-process-steps';

export function usePendingItems() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState<PendingItemsByType>({
    items: [],
    processes: [],
    bom: [],
    processSteps: [],
  });

  const progress = useSetupStore((state) => state.progress);
  const { items, isLoading: itemsLoading } = useItems();
  const { boms, isLoading: bomsLoading } = useBOM();
  const { processes, isLoading: processesLoading } = useProcesses();
  const { processSteps, isLoading: stepsLoading } = useProcessSteps();

  useEffect(() => {
    if (itemsLoading || bomsLoading || processesLoading || stepsLoading) {
      return;
    }

    // Calculate pending items based on actual data
    const newPendingItems: PendingItemsByType = {
      items: items.length === 0 ? [
        {
          id: 'items-setup',
          title: 'Set Up Initial Items',
          type: 'items',
          description: 'Add your first items to get started with the system',
          path: '/items',
        }
      ] : [],
      
      processes: items.length > 0 && processes.length === 0 ? [
        {
          id: 'processes-setup',
          title: 'Define Manufacturing Processes',
          type: 'processes',
          description: 'Create processes to organize your manufacturing workflow',
          path: '/processes',
        }
      ] : [],
      
      bom: items.length > 0 && boms.length === 0 ? [
        {
          id: 'bom-setup',
          title: 'Create Bill of Materials',
          type: 'bom',
          description: 'Define relationships between your items',
          dependencies: items.length === 0 ? ['Items'] : undefined,
          path: '/bom',
        }
      ] : [],
      
      processSteps: processes.length > 0 && processSteps.length === 0 ? [
        {
          id: 'steps-setup',
          title: 'Configure Process Steps',
          type: 'processSteps',
          description: 'Break down processes into detailed steps',
          dependencies: processes.length === 0 ? ['Processes'] : undefined,
          path: '/process-steps',
        }
      ] : [],
    };

    setPendingItems(newPendingItems);
    setIsLoading(false);
  }, [items, boms, processes, processSteps, itemsLoading, bomsLoading, processesLoading, stepsLoading]);

  return { pendingItems, isLoading };
}
