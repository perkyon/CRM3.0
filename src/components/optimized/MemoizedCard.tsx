import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency, formatDate, getPriorityColor } from '../../lib/utils';

interface MemoizedCardProps {
  id: string;
  title: string;
  status: string;
  priority: string;
  budget?: number;
  dueDate?: string;
  onClick?: (id: string) => void;
  className?: string;
}

export const MemoizedCard = memo<MemoizedCardProps>(({
  id,
  title,
  status,
  priority,
  budget,
  dueDate,
  onClick,
  className,
}) => {
  const handleClick = () => {
    onClick?.(id);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          <Badge className={getPriorityColor(priority)}>
            {priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Статус:</span>
          <Badge variant="outline">{status}</Badge>
        </div>
        
        {budget && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Бюджет:</span>
            <span className="font-medium">{formatCurrency(budget)}</span>
          </div>
        )}
        
        {dueDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Срок:</span>
            <span className="font-medium">{formatDate(dueDate)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MemoizedCard.displayName = 'MemoizedCard';
