import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-label-caps text-label-caps uppercase transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary rounded-full hover:scale-[1.03] shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
        secondary: 'bg-surface-variant text-on-surface rounded-full hover:bg-surface-dim',
        soft: 'bg-[#EAE8E4] text-primary rounded-full hover:bg-surface-variant',
        outline: 'border border-outline-variant text-on-surface rounded-full hover:bg-surface-container-low',
        ghost: 'text-on-surface-variant hover:text-primary rounded-full',
        destructive: 'bg-error text-on-error rounded-full hover:opacity-90',
        link: 'text-primary underline-offset-4 hover:underline normal-case',
      },
      size: {
        default: 'px-8 py-4 text-label-caps',
        sm: 'px-5 py-2.5 text-xs',
        lg: 'px-10 py-5 text-sm',
        icon: 'h-11 w-11 p-0 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
