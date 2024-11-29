'use client';

import { useSetupStore } from '@/stores/useSetupStore';
import { setupSteps } from '@/config/navigation';
import { SidebarNavItem } from './nav-item';
import { ProgressIndicator } from './progress-indicator';

export function Sidebar() {
  const progress = useSetupStore((state) => state.progress);
  
  // Calculate if a step should be disabled based on previous step completion
  const getIsStepDisabled = (index: number) => {
    if (index === 0) return false;
    const previousStep = setupSteps[index - 1];
    return !previousStep.isComplete;
  };

  // Update navigation items with current progress
  const navItems = setupSteps.map((step, index) => ({
    ...step,
    progress: progress[step.title.toLowerCase() as keyof typeof progress],
    isComplete: progress[step.title.toLowerCase() as keyof typeof progress] === 100,
  }));

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-4">
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
        <div className="space-y-2">
          {navItems.map((item, index) => (
            <SidebarNavItem
              key={item.path}
              item={item}
              isDisabled={getIsStepDisabled(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
