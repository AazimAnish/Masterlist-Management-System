'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PendingItem, PendingItemsByType } from '@/types/pending';
import { useSetupStore } from '@/stores/useSetupStore';

interface PendingItemsProps {
  items: PendingItemsByType;
}

export function PendingItems({ items }: PendingItemsProps) {
  const [expandedTypes, setExpandedTypes] = useState<string[]>([]);
  const progress = useSetupStore((state) => state.progress);

  const toggleType = (type: string) => {
    setExpandedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getPendingCount = (type: keyof PendingItemsByType) => {
    return items[type]?.length || 0;
  };

  const renderPendingItem = (item: PendingItem) => (
    <Link
      href={item.path}
      key={item.id}
      className="flex items-start space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
    >
      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.title}</p>
        <p className="text-xs text-gray-500">{item.description}</p>
        {item.dependencies && item.dependencies.length > 0 && (
          <div className="mt-1 text-xs text-amber-600">
            Dependencies: {item.dependencies.join(', ')}
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2 px-2">
        Pending Setup
      </h3>
      <div className="space-y-1">
        {Object.entries(items).map(([type, typeItems]) => {
          if (typeItems.length === 0) return null;
          
          const isExpanded = expandedTypes.includes(type);
          const pendingCount = getPendingCount(type as keyof PendingItemsByType);
          
          return (
            <div key={type} className="space-y-1">
              <button
                onClick={() => toggleType(type)}
                className={cn(
                  'w-full flex items-center justify-between px-2 py-1.5',
                  'text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-md'
                )}
              >
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="capitalize">{type}</span>
                </div>
                <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-xs">
                  {pendingCount}
                </span>
              </button>
              {isExpanded && (
                <div className="ml-2 space-y-1">
                  {typeItems.map(renderPendingItem)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
