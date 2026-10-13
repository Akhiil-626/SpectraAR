import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-hover-select="true"
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-[14px] border border-border bg-surface px-4 py-2 text-xs font-mono uppercase tracking-wider text-text-primary transition-colors',
      'placeholder:text-text-muted hover:border-text-muted',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg',
      'disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-text-muted transition-transform duration-150" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-text-muted',
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-text-muted',
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-[10002] max-h-80 min-w-[14rem] overflow-hidden rounded-[14px] border border-[rgba(var(--color-fg-rgb)/0.25)] bg-[var(--color-bg)] text-text-primary shadow-none',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1.5 data-[side=top]:-translate-y-1.5',
        className
      )}
      style={{
        backgroundColor: 'var(--color-bg)',
      }}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1.5 overflow-y-auto max-h-72',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full min-h-[40px] cursor-pointer select-none items-center justify-between rounded-[8px] px-3 py-2 text-xs font-mono text-text-primary outline-none transition-colors duration-100',
      'hover:bg-[rgba(var(--color-fg-rgb)/0.12)] focus:bg-[rgba(var(--color-fg-rgb)/0.12)] data-[highlighted]:bg-[rgba(var(--color-fg-rgb)/0.12)]',
      'data-[state=checked]:bg-[rgba(var(--color-fg-rgb)/0.18)] data-[state=checked]:font-bold data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
      'focus-visible:ring-1 focus-visible:ring-fg',
      className
    )}
    {...props}
  >
    <div className="flex items-center flex-1 mr-3 min-w-0">
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </div>

    {/* Check icon positioned at the right */}
    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-accent" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
};
