import React from 'react';
import { ChevronDown, ChevronRight, Package, Component, CheckCircle2, Circle, Clock } from 'lucide-react';
import { ProductionItem, KanbanTask } from '../../types';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';

interface ProductionTreeNodeProps {
  item: ProductionItem;
  level: number;
  isExpanded: boolean;
  onToggle: (itemId: string) => void;
  onTaskCheck: (taskId: string, checked: boolean) => void;
  onOpenTask: (task: KanbanTask) => void;
  onOpenItem: (item: ProductionItem) => void;
}

const statusColors = {
  planned: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-orange-100 text-orange-700'
};

const statusLabels = {
  planned: 'Запланировано',
  in_progress: 'В работе',
  completed: 'Завершено',
  on_hold: 'На паузе'
};

export function ProductionTreeNode({
  item,
  level,
  isExpanded,
  onToggle,
  onTaskCheck,
  onOpenTask,
  onOpenItem
}: ProductionTreeNodeProps) {
  const hasChildren = (item.children && item.children.length > 0) || (item.tasks && item.tasks.length > 0);
  const indentClass = `pl-${level * 6}`;

  return (
    <div className="border-b last:border-b-0">
      {/* Item Row */}
      <div 
        className={cn(
          "flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer",
          `pl-${level * 6}`
        )}
        onClick={() => onOpenItem(item)}
      >
        {/* Toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(item.id);
          }}
          className={cn(
            "p-1 hover:bg-accent rounded transition-colors",
            !hasChildren && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        {/* Icon */}
        <div className={cn(
          "flex items-center justify-center size-8 rounded",
          item.type === 'furniture' ? 'bg-purple-100' : 'bg-blue-100'
        )}>
          {item.type === 'furniture' ? (
            <Package className="size-4 text-purple-600" />
          ) : (
            <Component className="size-4 text-blue-600" />
          )}
        </div>

        {/* Name and code */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{item.name}</h4>
            {item.code && (
              <code className="text-xs bg-muted px-2 py-0.5 rounded">{item.code}</code>
            )}
          </div>
          {item.material?.name && (
            <p className="text-sm text-muted-foreground truncate">
              {item.material.sku && `${item.material.sku} — `}
              {item.material.name}
              {item.material.qty && ` — ${item.material.qty} ${item.material.unit || ''}`}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress value={item.progressPercent} className="w-16" />
          <span className="text-sm font-medium text-muted-foreground w-10 text-right">
            {item.progressPercent}%
          </span>
        </div>

        {/* Status */}
        <Badge variant="secondary" className={cn("text-xs", statusColors[item.status])}>
          {statusLabels[item.status]}
        </Badge>

        {/* Quantity */}
        {item.quantity > 1 && (
          <span className="text-sm text-muted-foreground">
            {item.quantity} {item.unit}
          </span>
        )}
      </div>

      {/* Children (nested items) */}
      {isExpanded && item.children && item.children.length > 0 && (
        <div>
          {item.children.map(child => (
            <ProductionTreeNode
              key={child.id}
              item={child}
              level={level + 1}
              isExpanded={false} // Children start collapsed
              onToggle={onToggle}
              onTaskCheck={onTaskCheck}
              onOpenTask={onOpenTask}
              onOpenItem={onOpenItem}
            />
          ))}
        </div>
      )}

      {/* Tasks */}
      {isExpanded && item.tasks && item.tasks.length > 0 && (
        <div className={cn("bg-muted/30", `pl-${(level + 1) * 6}`)}>
          {item.tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 pl-12 hover:bg-accent/30 transition-colors cursor-pointer border-t border-border/50"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTask(task);
              }}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle task completion
                  const isCompleted = task.columnId?.includes('done');
                  onTaskCheck(task.id, !isCompleted);
                }}
                className="flex-shrink-0"
              >
                {task.columnId?.includes('done') ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" />
                )}
              </button>

              {/* Task name */}
              <span className={cn(
                "flex-1 text-sm",
                task.columnId?.includes('done') && "line-through text-muted-foreground"
              )}>
                {task.title}
              </span>

              {/* Time estimate */}
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                </div>
              )}

              {/* Assignee initials */}
              {task.assigneeId && (
                <div className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {task.assigneeId.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Priority badge */}
              {task.priority !== 'medium' && (
                <Badge 
                  variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {task.priority === 'high' ? 'Высокий' : 
                   task.priority === 'urgent' ? 'Срочно' : 'Низкий'}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

