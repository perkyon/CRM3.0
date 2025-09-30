import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  MoreHorizontal, 
  Plus, 
  GripVertical,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { KanbanColumn, KanbanTask } from '../../types';
import { ModernKanbanCard, AddTaskCard } from './ModernKanbanCard';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';


interface ModernKanbanColumnProps {
  column: KanbanColumn;
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
      className={`flex-shrink-0 w-80 transition-all duration-200 ${
        isDragOver ? 'bg-blue-50 rounded-lg' : ''
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Card className="bg-gray-50 border-0 shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className="size-4 text-gray-400 cursor-grab" />
              
              {isEditingTitle ? (
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleKeyDown}
                  className="font-medium text-base bg-white border-2 border-blue-500"
                  autoFocus
                />
              ) : (
                <h3 
                  className="font-medium text-base text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex-1"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {column.title}
                </h3>
              )}

              <div className="bg-white px-2 py-0.5 rounded-full">
                <span className="text-sm font-medium text-gray-600">
                  {tasks.length}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Удалить колонку
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {tasks.map((task) => (
              <ModernKanbanCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                onDragStart={(e) => onDragStart(e, { type: 'task', data: task, sourceColumnId: column.id })}
              />
            ))}

            {isAddingTask ? (
              <AddTaskForm
                onAddTask={onAddTask}
                onCancel={() => setIsAddingTask(false)}
              />
            ) : (
              <AddTaskCard onAddTask={() => setIsAddingTask(true)} />
            )}
          </div>
        </CardContent>
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
    <Card className="border-2 border-blue-500 shadow-md">
      <CardContent className="p-3 space-y-3">
        <Input
          placeholder="Введите название задачи..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-0 text-base font-medium focus:ring-0 focus:border-0 p-0"
          autoFocus
        />
        
        <Textarea
          placeholder="Описание (необязательно)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="border-0 text-sm resize-none focus:ring-0 focus:border-0 p-0"
        />
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={!title.trim()}
            className="bg-blue-600 hover:bg-blue-700"
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
      <div className="flex-shrink-0 w-80">
        <Card className="bg-gray-50 border-2 border-blue-500">
          <CardContent className="p-4">
            <Input
              placeholder="Введите название колонки"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-3 text-base font-medium"
              autoFocus
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                disabled={!title.trim()}
                className="bg-blue-600 hover:bg-blue-700"
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
    <div className="flex-shrink-0 w-80">
      <Card 
        className="bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => setIsAdding(true)}
      >
        <CardContent className="p-4 flex items-center justify-center text-gray-600 hover:text-gray-800">
          <Plus className="size-4 mr-2" />
          <span className="font-medium">Добавить ещё одну колонку</span>
        </CardContent>
      </Card>
    </div>
  );
}