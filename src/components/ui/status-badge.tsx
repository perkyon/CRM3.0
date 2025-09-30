import React from 'react';
import { Badge } from './badge';
import { getStatusColor } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`${getStatusColor(status)} ${className}`}
    >
      {children}
    </Badge>
  );
}