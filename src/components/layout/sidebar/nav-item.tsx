'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { ProgressIndicator } from './progress-indicator';
import { cn } from '@/lib/utils';
import { SidebarNavItemProps } from '@/types/components';

export function SidebarNavItem({ 
  item, 
  isDisabled 
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.path;

  return (
    <Link
      href={isDisabled ? '#' : item.path}
      className={cn(
        'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
        isDisabled && 'pointer-events-none opacity-50'
      )}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center">
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          <span>{item.title}</span>
          {item.isComplete && (
            <span className="ml-2 text-xs text-green-500">(Complete)</span>
          )}
        </div>
        <ProgressIndicator progress={item.progress} size="sm" />
      </div>
    </Link>
  );
}
