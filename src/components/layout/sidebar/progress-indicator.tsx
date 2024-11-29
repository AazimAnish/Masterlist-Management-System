import { cn } from '@/lib/utils';
import { ProgressIndicatorProps } from '@/types/components';

export function ProgressIndicator({ 
  progress, 
  size = 'md' 
}: ProgressIndicatorProps) {
  return (
    <div className={cn(
      "relative w-full bg-gray-200 rounded-full",
      {
        'h-2': size === 'sm',
        'h-3': size === 'md',
        'h-4': size === 'lg',
      }
    )}>
      <div
        className="bg-primary h-full rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
