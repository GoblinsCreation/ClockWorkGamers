import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  icon, 
  action,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6', className)}>
      <div className="flex items-start sm:items-center gap-4">
        {icon && (
          <div className="hidden sm:flex items-center justify-center h-12 w-12 rounded-lg bg-[hsl(var(--cwg-dark))] text-[hsl(var(--cwg-blue))]">
            {icon}
          </div>
        )}
        
        <div>
          <h1 className="text-2xl font-bold neon-text-blue">{title}</h1>
          {description && (
            <p className="text-[hsl(var(--cwg-muted))] mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}