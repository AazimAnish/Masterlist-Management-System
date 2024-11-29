'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { setupSteps } from '@/config/navigation';
import { useSetupStore } from '@/stores/useSetupStore';

export function TabNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const progress = useSetupStore((state) => state.progress);

  return (
    <div className=" border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {setupSteps.map((tab) => {
          const isActive = pathname === tab.path;
          const currentProgress = progress[tab.title.toLowerCase() as keyof typeof progress];

          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={cn(
                'relative py-4 px-1 group inline-flex items-center gap-2',
                'border-b-2 font-medium text-sm',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.title}</span>
              {currentProgress > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {currentProgress}%
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
