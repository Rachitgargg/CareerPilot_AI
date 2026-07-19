import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-metadata text-metadata px-4 py-2 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-variant text-on-surface',
        white: 'bg-white text-primary border border-outline/10 shadow-sm',
        dashed: 'bg-surface-variant/50 border border-outline-variant border-dashed text-on-surface-variant',
        primary: 'bg-primary text-on-primary',
        error: 'bg-error-container text-on-error-container',
        sage: 'bg-sage text-primary',
        blush: 'bg-blush text-primary',
        butter: 'bg-butter text-primary',
        lavender: 'bg-lavender text-primary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
