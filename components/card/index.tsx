import React from 'react';
import { Card as ShadcnCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  extra?: string;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ extra, className, children, ...props }, ref) => {
    return (
      <ShadcnCard
        ref={ref}
        className={cn(
          'flex flex-col bg-white bg-clip-border shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:shadow-none',
          extra,
          className
        )}
        {...props}
      >
        {children}
      </ShadcnCard>
    );
  }
);

Card.displayName = 'Card';

export default Card;
