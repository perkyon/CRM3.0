import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  MoreHorizontal, 
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { KanbanColumn, KanbanTask } from '../../types';
import { ModernKanbanCard } from './ModernKanbanCard';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';


interface ModernKanbanColumnProps {
  column: KanbanColumn;
  columnIndex: number;
  tasks: KanbanTask[];
  onAddTask: (title: string, description?: string) => void;
  onUpdateColumn: (updates: Partial<KanbanColumn>) => void;
  onDeleteColumn: () => void;
  onTaskClick: (task: KanbanTask) => void;
  onDragStart: (e: React.DragEvent, item: any) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
}

export function ModernKanbanColumn({
  column,
  columnIndex,
  tasks,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onTaskClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver
}: ModernKanbanColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState(column.title);
  const { accentColor, backgroundColor } = getColumnColors(column.color, columnIndex);

  const handleSaveTitle = () => {
    if (newTitle.trim() && newTitle !== column.title) {
      onUpdateColumn({ title: newTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setNewTitle(column.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div 
      className={`flex-shrink-0 w-[296px] min-w-[296px] max-w-[296px] transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-offset-2 ring-sky-400/60 ring-offset-slate-100 rounded-[16px]' : ''
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Card className="bg-transparent border-none shadow-none">
        <div
          className="flex h-full flex-col rounded-[16px] border border-slate-200/80 bg-white shadow-[0_6px_16px_rgba(16,24,40,0.12)] overflow-hidden"
          style={{ backgroundColor }}
        >
          <div
            className="w-full rounded-t-[16px]"
            style={{ backgroundColor: accentColor, height: '9px' }}
          />
          <CardHeader
            className="px-3 pt-3 pb-2 border-b border-slate-200/60 rounded-t-2xl"
            style={{ backgroundColor: hexToRgba(accentColor, 0.12) }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div
                  className="mt-1 size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                
                {isEditingTitle ? (
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={handleKeyDown}
                    className="font-semibold text-[15px] bg-white border border-sky-300 h-9"
                    autoFocus
                  />
                ) : (
                  <h3 
                    className="font-semibold text-[15px] leading-5 text-slate-900 cursor-pointer hover:text-sky-700 transition-colors flex-1 break-words"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {column.title}
                  </h3>
                )}

                <div className="px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 leading-none">
                  {tasks.length}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="size-8 p-0 text-slate-500 hover:text-slate-700"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                    <Edit2 className="size-4 mr-2" />
                    Переименовать
                  </DropdownMenuItem>
                  {!column.isDefault && (
                    <DropdownMenuItem 
                      onClick={onDeleteColumn}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Удалить колонку
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              className="mt-3 text-base text-[#2f64e1] hover:text-[#1f4fb8] font-semibold inline-flex items-center gap-2"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="size-4" />
              Добавить задачу
            </button>
          </CardHeader>

          <CardContent className="px-3 pt-2 pb-4 flex-1 flex flex-col">
          <div className="space-y-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
              {tasks.map((task) => (
                <ModernKanbanCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onDragStart={(e) => onDragStart(e, { type: 'task', data: task, sourceColumnId: column.id })}
                />
              ))}

              {isAddingTask && (
                <AddTaskForm
                  onAddTask={onAddTask}
                  onCancel={() => setIsAddingTask(false)}
                />
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

// Форма добавления задачи
function AddTaskForm({
  onAddTask,
  onCancel
}: {
  onAddTask: (title: string, description?: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onAddTask(title.trim(), description.trim() || undefined);
      setTitle('');
      setDescription('');
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Card className="border border-sky-200 shadow-[0_10px_20px_rgba(56,189,248,0.08)] bg-white/90">
      <CardContent className="p-3 space-y-3">
        <Input
          placeholder="Введите название задачи..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border text-base font-medium focus:ring-2 focus:ring-sky-300"
          autoFocus
        />
        
        <Textarea
          placeholder="Описание (необязательно)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="border text-sm resize-none focus:ring-2 focus:ring-sky-300"
        />
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={!title.trim()}
            className="bg-sky-700 hover:bg-sky-800"
          >
            Добавить карточку
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Карточка добавления новой колонки
export function AddColumnCard({
  onAddColumn
}: {
  onAddColumn: (title: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onAddColumn(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setTitle('');
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <div className="flex-shrink-0 w-[296px]">
        <Card className="bg-white border border-dashed border-slate-300 shadow-sm rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Введите название колонки"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-base font-medium"
              autoFocus
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                disabled={!title.trim()}
                className="bg-sky-700 hover:bg-sky-800"
              >
                Добавить колонку
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setTitle('');
                  setIsAdding(false);
                }}
                className="text-gray-600"
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-[296px] min-w-[296px] max-w-[296px]">
      <Card 
        className="h-full min-h-[180px] border border-dashed border-slate-300 bg-white/60 hover:border-slate-400 transition-colors cursor-pointer rounded-2xl shadow-none"
        onClick={() => setIsAdding(true)}
      >
        <CardContent className="p-4 flex items-start justify-start text-slate-600 hover:text-slate-800">
          <Plus className="size-4 mr-2 mt-1" />
          <span className="font-semibold">Добавить колонку</span>
        </CardContent>
      </Card>
    </div>
  );
}

const accentPalette = ['#7B869E', '#E8A24F', '#FCE258', '#49C5BC', '#8CACFF'];
const bgPalette = ['#E3E4EE', '#ECE7E0', '#EBEBE0', '#E0ECEB', '#E0E8EC'];

function hexToRgba(hex: string, alpha = 0.12) {
  if (!hex) return `rgba(148, 163, 184, ${alpha})`;
  const cleaned = hex.replace('#', '');
  const normalized = cleaned.length === 3
    ? cleaned.split('').map(char => char + char).join('')
    : cleaned;

  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(148, 163, 184, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getColumnColors(color?: string, index = 0) {
  const accentColor = color || accentPalette[index % accentPalette.length];
  const backgroundColor = bgPalette[index % bgPalette.length] || hexToRgba(accentColor, 0.16);
  return {
    accentColor,
    backgroundColor
  };
}
