import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Eye, 
  Calendar, 
  CheckSquare, 
  Clock,
  User,
  Paperclip,
  MessageSquare,
  AlertTriangle,
  Wrench,
  Package,
  Paintbrush,
  Scissors,
  Settings
} from 'lucide-react';
import { KanbanTask } from '../../types';
import { useUsers } from '../../lib/hooks/useUsers';

interface ModernKanbanCardProps {
  task: KanbanTask;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export function ModernKanbanCard({ task, onClick, onDragStart }: ModernKanbanCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { users } = useUsers();
  
  const completedTasks = task.checklist.filter(item => item.completed).length;
  const totalTasks = task.checklist.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getStageIcon = () => {
    const columnStage = task.columnId;
    if (columnStage.includes('cutting')) return <Scissors className="size-3" />;
    if (columnStage.includes('painting')) return <Paintbrush className="size-3" />;
    if (columnStage.includes('assembly')) return <Wrench className="size-3" />;
    if (columnStage.includes('packaging')) return <Package className="size-3" />;
    return <Settings className="size-3" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-0 bg-white ${
        isHovered ? 'shadow-lg' : 'shadow-sm'
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={onDragStart}
    >
      {/* Priority Indicator */}
      <div className={`h-1 rounded-t-lg ${getPriorityColor()}`} />
      
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-base text-gray-900 line-clamp-2 flex-1">
            {task.title}
          </h4>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
            <Eye className="size-3 text-gray-400" />
          </div>
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-green-100 text-green-700 border-green-200"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <Badge 
              variant={isOverdue ? "destructive" : "secondary"}
              className={`text-xs px-2 py-1 flex items-center gap-1 ${
                isOverdue 
                  ? 'bg-red-100 text-red-700 border-red-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              <Calendar className="size-3" />
              {formatDate(task.dueDate)}
              {isOverdue && <AlertTriangle className="size-3" />}
            </Badge>
          </div>
        )}

        {/* Progress */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-2">
            <CheckSquare className="size-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">
              {completedTasks}/{totalTasks}
            </span>
            <Progress 
              value={progress} 
              className="flex-1 h-1.5"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Assignee */}
            {assignee ? (
              <Avatar className="size-6">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="size-6 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="size-3 text-gray-400" />
              </div>
            )}
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2 text-gray-400">
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                <span className="text-xs">{task.comments.length}</span>
              </div>
            )}
            {task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="size-3" />
                <span className="text-xs">{task.attachments.length}</span>
              </div>
            )}
            {getStageIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Карточка добавления новой задачи
export function AddTaskCard({ onAddTask }: { onAddTask: () => void }) {
  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
      <CardContent 
        className="p-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        onClick={onAddTask}
      >
        <Button
          variant="ghost"
          className="w-full justify-start text-left p-0 h-auto font-normal"
        >
          <span className="text-xl mr-2">+</span>
          Добавить карточку
        </Button>
      </CardContent>
    </Card>
  );
}