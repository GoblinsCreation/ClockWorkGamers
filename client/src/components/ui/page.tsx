import React from 'react';
import { cn } from '@/lib/utils';

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Page({ children, className, ...props }: PageProps) {
  return (
    <div className={cn('container px-4 py-6 mx-auto max-w-7xl', className)} {...props}>
      {children}
    </div>
  );
}