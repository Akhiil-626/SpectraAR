import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'accent';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-mono text-xs uppercase tracking-wider transition-colors duration-150',
          'focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent focus-visible:outline-offset-1',
          'disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer border',
          {
            // default: surface background, solid border, primary text
            'bg-surface border-border text-text-primary hover:border-accent hover:text-accent':
              variant === 'default',
            // outline: transparent background, solid border
            'bg-transparent border-border text-text-primary hover:border-accent hover:text-accent':
              variant === 'outline',
            // ghost: border transparent unless hovered
            'bg-transparent border-transparent text-text-muted hover:text-text-primary hover:border-border':
              variant === 'ghost',
            // accent: solid accent color, dark text
            'bg-accent text-accent-fg border-accent font-medium hover:opacity-90':
              variant === 'accent',
          },
          {
            'h-9 px-4 py-1.5 text-xs rounded-full': size === 'default',
            'h-7 px-3 text-[11px] rounded-full': size === 'sm',
            'h-11 px-6 text-sm rounded-full': size === 'lg',
            'h-8 w-8 rounded-full': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
