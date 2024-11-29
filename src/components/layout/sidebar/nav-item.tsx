'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { NavItem } from '@/types/navigation';
import { ProgressIndicator } from './progress-indicator';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  item: NavItem;
  isDisabled?: boolean;
}

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
        'flex flex-col space-y-2 p-3 rounded-lg transition-colors',
        isActive ? 'bg-primary/10' : 'hover:bg-primary/5',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <item.icon className="w-5 h-5" />
          <span className="font-medium">{item.title}</span>
        </div>
        {item.isComplete && (
          <div className="text-green-500">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>
      <ProgressIndicator progress={item.progress} size="sm" />
    </Link>
  );
}
