import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, onChange, value, defaultValue, ...props }, ref) => {
    const hasControlledValue = value !== undefined;
    const toText = (val: unknown) =>
      val === undefined || val === null ? '' : String(val);
    const [internalValue, setInternalValue] = React.useState(
      hasControlledValue ? toText(value) : toText(defaultValue)
    );

    React.useEffect(() => {
      if (hasControlledValue) {
        setInternalValue(toText(value));
      }
    }, [hasControlledValue, value]);

    const hasValue = internalValue.trim().length > 0;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!hasControlledValue) {
        setInternalValue(event.target.value);
      }
      onChange?.(event);
    };

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
          !className?.includes('bg-') && (hasValue ? 'bg-white' : 'bg-zinc-100')
        )}
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
