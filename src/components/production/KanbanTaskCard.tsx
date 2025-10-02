import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { KanbanTask } from '../../types';
import { formatDate, getPriorityColor } from '../../lib/utils';

interface KanbanTaskCardProps {
  task: KanbanTask;
  onViewDetails: () => void;
  onAdvance?: () => void;
}

export function KanbanTaskCard({ task, onViewDetails, onAdvance }: KanbanTaskCardProps) {
  const completedChecklist = task.checklist?.filter(item => item.completed).length || 0;
  const totalChecklist = task.checklist?.length || 0;
  const progress = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

  const getRiskColor = (level: string) => {
    const colors = {
      none: '',
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || '';
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewDetails}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <Badge 
              variant="outline" 
              className={`ml-2 text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority === 'high' ? 'Высокий' : 
               task.priority === 'medium' ? 'Средний' : 'Низкий'}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="size-3" />
            <span>{task.assignee?.name || 'Не назначен'}</span>
          </div>
          
          {task.dueDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {totalChecklist > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-medium">{completedChecklist}/{totalChecklist}</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {task.status === 'done' && (
                <CheckCircle2 className="size-4 text-green-600" />
              )}
              {task.status === 'in_progress' && (
                <Clock className="size-4 text-blue-600" />
              )}
              {task.priority === 'high' && (
                <AlertTriangle className="size-4 text-red-600" />
              )}
            </div>
            
            {onAdvance && task.status !== 'done' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdvance();
                }}
              >
                <ChevronRight className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
