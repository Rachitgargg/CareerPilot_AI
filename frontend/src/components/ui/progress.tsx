import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  trackClassName?: string;
  barClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, className, trackClassName, barClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('w-full bg-surface-variant rounded-full h-3 overflow-hidden', trackClassName, className)}
      {...props}
    >
      <div
        className={cn('bg-primary h-full rounded-full transition-all duration-500', barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
);
Progress.displayName = 'Progress';

export { Progress };
