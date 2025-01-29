'use client';

import { useSetupStore } from '@/stores/useSetupStore';
import { setupSteps } from '@/config/navigation';
import { SidebarNavItem } from './nav-item';
import { ProgressIndicator } from './progress-indicator';
import { PendingItems } from './pending-items';
import { usePendingItems } from '@/hooks/usePendingItems';
import { useItems } from '@/hooks/use-items';
import { useBOM } from '@/hooks/use-bom';
import { useProcesses } from '@/hooks/use-processes';
import { useProcessSteps } from '@/hooks/use-process-steps';
import { useEffect } from 'react';

export function Sidebar() {
    const progress = useSetupStore((state) => state.progress);
    const updateProgress = useSetupStore((state) => state.updateProgress);
    const { pendingItems, isLoading: pendingLoading } = usePendingItems();
    const { items, isLoading: itemsLoading } = useItems();
    const { boms, isLoading: bomsLoading } = useBOM();
    const { processes, isLoading: processesLoading } = useProcesses();
    const { processSteps, isLoading: stepsLoading } = useProcessSteps();

    // Calculate if a step should be disabled based on previous step completion
    const getIsStepDisabled = (index: number) => {
        if (index === 0) return false;
        const previousStep = setupSteps[index - 1];
        return progress[previousStep.title.toLowerCase() as keyof typeof progress] < 100;
    };

    // Calculate real progress based on actual data
    useEffect(() => {
        if (itemsLoading || bomsLoading || processesLoading || stepsLoading) {
            return;
        }

        // Items progress: Based on having at least 5 items
        const itemsProgress = Math.min(Math.round((items.length / 5) * 100), 100);
        updateProgress('items', itemsProgress);

        // BOM progress: Based on having BOMs for all sell and component items
        const sellAndComponentItems = items.filter(item => ['sell', 'component'].includes(item.type));
        const itemsWithBOMs = new Set(boms.map(bom => bom.item_id));
        const bomProgress = sellAndComponentItems.length === 0 ? 0 :
            Math.round((itemsWithBOMs.size / sellAndComponentItems.length) * 100);
        updateProgress('bom', bomProgress);

        // Processes progress: Based on having at least 3 processes
        const processesProgress = Math.min(Math.round((processes.length / 3) * 100), 100);
        updateProgress('processes', processesProgress);

        // Process Steps progress: Based on having steps for all processes
        const processesWithSteps = new Set(processSteps.map(step => step.process_id));
        const stepsProgress = processes.length === 0 ? 0 :
            Math.round((processesWithSteps.size / processes.length) * 100);
        updateProgress('processSteps', stepsProgress);

    }, [items, boms, processes, processSteps, itemsLoading, bomsLoading, processesLoading, stepsLoading, updateProgress]);

    // Update navigation items with current progress
    const navItems = setupSteps.map((step, index) => ({
        ...step,
        progress: progress[step.title.toLowerCase() as keyof typeof progress] || 0,
        isComplete: (progress[step.title.toLowerCase() as keyof typeof progress] || 0) === 100,
    }));

    const isLoading = itemsLoading || bomsLoading || processesLoading || stepsLoading || pendingLoading;

    if (isLoading) {
        return <div className="w-64 h-screen bg-white border-r border-gray-200 p-4">Loading...</div>;
    }

    return (
        <aside className="w-64 h-screen bg-white border-r border-gray-200 p-4 flex flex-col">
            <div className="flex flex-col space-y-1">
                <h2 className="text-lg font-semibold mb-4">Setup Progress</h2>

                {/* Overall progress indicator */}
                <div className="mb-6">
                    <ProgressIndicator
                        progress={
                            Object.values(progress).reduce((a, b) => a + b, 0) /
                            Object.values(progress).length
                        }
                        size="lg"
                    />
                </div>

                {/* Navigation items */}
                <nav className="space-y-2">
                    {navItems.map((item, index) => (
                        <SidebarNavItem
                            key={item.path}
                            item={item}
                            isDisabled={getIsStepDisabled(index)}
                        />
                    ))}
                </nav>
            </div>

            {!isLoading && <PendingItems items={pendingItems} />}
        </aside>
    );
}
