import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  Calendar, 
  CheckSquare, 
  User,
  Paperclip,
  MessageSquare,
  AlertTriangle,
  MoreVertical
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-150 hover:-translate-y-0.5 border border-slate-200 bg-white rounded-[12px] ${
        isHovered 
          ? 'shadow-[0_6px_16px_rgba(16,24,40,0.12)]' 
          : 'shadow-[0_4px_10px_rgba(16,24,40,0.08)]'
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable
      onDragStart={onDragStart}
    >
      <CardContent className="p-3.5 space-y-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[12px] text-slate-600 shrink-0">
            <CheckSquare className="size-3" />
          </span>
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-start gap-2">
              <h4 className="font-semibold text-[15px] leading-[18px] text-slate-900 line-clamp-3 break-words flex-1">
                {task.title}
              </h4>
              <MoreVertical className="size-4 text-slate-400 shrink-0" />
            </div>

            {task.dueDate && (
              <span 
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border ${
                  isOverdue 
                    ? 'bg-[#fff1f0] text-[#d83a52] border-[#f7d0d5]' 
                    : 'bg-[#eef4ff] text-[#1d4ed8] border-[#c7d7ff]'
                }`}
              >
                <Calendar className="size-3" />
                {formatDate(task.dueDate)}
                {isOverdue && <AlertTriangle className="size-3" />}
              </span>
            )}

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {task.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold border border-[#f5c8c8] bg-[#ffe8e8] text-[#d83a52]"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="px-2 py-1 rounded-md text-[11px] font-semibold border border-[#dbe4f3] bg-[#f3f6fb] text-slate-700">
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="flex items-center gap-2">
            <CheckSquare className="size-4 text-slate-500" />
            <span className="text-[12px] text-slate-600 font-semibold">
              {completedTasks}/{totalTasks}
            </span>
            <Progress 
              value={progress} 
              className="flex-1 h-2 bg-transparent"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {assignee ? (
              <Avatar className="size-7 ring-2 ring-white shadow-sm">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-xs bg-sky-100 text-sky-700">
                  {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="size-3.5 text-slate-400" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                <span className="text-[11px] font-semibold text-slate-600">{task.comments.length}</span>
              </div>
            )}
            {task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="size-3" />
                <span className="text-[11px] font-semibold text-slate-600">{task.attachments.length}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Карточка добавления новой задачи
export function AddTaskCard({ onAddTask }: { onAddTask: () => void }) {
  return (
    <Card className="border border-dashed border-slate-300 hover:border-slate-400 bg-white/70 transition-colors cursor-pointer rounded-xl shadow-none">
      <CardContent 
        className="p-3 flex items-center gap-2 text-slate-600 hover:text-slate-800"
        onClick={onAddTask}
      >
        <Button
          variant="ghost"
          className="w-full justify-start text-left p-0 h-auto font-semibold text-[13px]"
        >
          <span className="text-xl mr-2">+</span>
          Добавить карточку
        </Button>
      </CardContent>
    </Card>
  );
}
