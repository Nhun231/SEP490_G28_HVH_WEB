'use client';

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const ToasterWithTheme = (props: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  return <Sonner theme={theme as ToasterProps['theme']} {...props} />;
};

const Toaster = (props: ToasterProps) => (
  <ToasterWithTheme
    position="top-center"
    className="toaster group"
    richColors
    icons={{
      success: <CircleCheck className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
      warning: <TriangleAlert className="h-4 w-4" />,
      error: <OctagonX className="h-4 w-4" />,
      loading: <LoaderCircle className="h-4 w-4 animate-spin" />
    }}
    toastOptions={{
      classNames: {
        toast:
          'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg data-[type=success]:!border-green-200 data-[type=success]:!bg-green-50 data-[type=success]:!text-green-700 data-[type=error]:!border-red-200 data-[type=error]:!bg-red-50 data-[type=error]:!text-red-700',
        description:
          'group-[.toast]:text-muted-foreground group-[.toast][data-type=success]:text-green-700 group-[.toast][data-type=error]:text-red-700',
        actionButton:
          'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
      }
    }}
    {...props}
  />
);

export { Toaster };
