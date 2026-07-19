import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  actions?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  actions,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end md:justify-between gap-4',
        align === 'center' && 'text-center md:text-left',
        className
      )}
    >
      <div>
        {eyebrow && (
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
            {eyebrow}
          </span>
        )}
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mt-1">
          {title}
        </h2>
        {description && (
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
