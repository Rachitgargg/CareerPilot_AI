import { cn } from '@/utils/cn';

export interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  showLabel?: boolean;
}

/**
 * Circular progress indicator built with a plain SVG so it can be reused
 * anywhere without pulling in a charting library.
 */
export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  className,
  trackClassName,
  showLabel = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className={cn('text-surface-variant', trackClassName)}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn('text-primary progress-ring__circle', className)}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showLabel && (
        <span className="absolute font-metadata text-metadata text-primary font-bold">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
