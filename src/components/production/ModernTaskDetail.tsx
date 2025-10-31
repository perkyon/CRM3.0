import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { DatePicker } from '../ui/date-picker';
import { toast } from '../../lib/toast';
import { 
  Plus, 
  User, 
  Calendar, 
  Tag,
  CheckSquare,
  Paperclip,
  MessageSquare,
  Clock,
  AlertTriangle,
  X,
  Trash2,
  Eye,
  Copy,
  Settings,
  Activity
} from 'lucide-react';
import { KanbanTask, ChecklistItem, User as UserType } from '../../types';
import { supabase } from '../../lib/supabase/config';
import { supabaseKanbanService } from '../../lib/supabase/services/KanbanService';
import { useAuth } from '../../contexts/AuthContext';

interface ModernTaskDetailProps {
  task: KanbanTask;
  onUpdateTask: (updates: Partial<KanbanTask>) => void;
  onDeleteTask: () => void;
  onClose: () => void;
  users: UserType[];
  columns: Array<{ id: string; title: string; stage: string }>;
}

export function ModernTaskDetail({
  task,
  onUpdateTask,
  onDeleteTask,
  onClose,
  users,
  columns
}: ModernTaskDetailProps) {
  const { user: currentUser } = useAuth();
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(task.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);

  // Обновляем локальное состояние при изменении задачи извне
  React.useEffect(() => {
    if (task.checklist) setChecklist(task.checklist);
    if (task.description !== undefined) setDescription(task.description || '');
    if (task.title) setTitle(task.title);
    if (task.dueDate !== undefined) setDueDate(task.dueDate);
  }, [task.id, task.checklist, task.description, task.title, task.dueDate]);

  const completedTasks = checklist.filter(item => item.completed).length;
  const totalTasks = checklist.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const currentColumn = columns.find(col => col.id === task.columnId);

  const toggleChecklistItem = (id: string) => {
    const newChecklist = checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(newChecklist);
    onUpdateTask({ checklist: newChecklist });
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: `CHK-${Date.now()}`,
        text: newChecklistItem.trim(),
        completed: false
      };
      const newChecklist = [...checklist, newItem];
      setChecklist(newChecklist);
      onUpdateTask({ checklist: newChecklist });
      setNewChecklistItem('');
      toast.success('Пункт добавлен в чек-лист');
    }
  };

  const removeChecklistItem = (id: string) => {
    const newChecklist = checklist.filter(item => item.id !== id);
    setChecklist(newChecklist);
    onUpdateTask({ checklist: newChecklist });
    toast.success('Пункт удален из чек-листа');
  };

  const handleDescriptionSave = () => {
    onUpdateTask({ description: description.trim() || undefined });
    setIsEditingDescription(false);
    if (description.trim()) {
      toast.success('Описание обновлено');
    }
  };

  const handleTitleSave = () => {
    if (title.trim()) {
      onUpdateTask({ title: title.trim() });
      setIsEditingTitle(false);
      toast.success('Название обновлено');
    }
  };

  const handleDueDateSave = () => {
    onUpdateTask({ dueDate: dueDate || null });
    setIsEditingDueDate(false);
    toast.success('Список обновлен');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !task.tags.includes(newTag.trim())) {
      const newTags = [...task.tags, newTag.trim()];
      onUpdateTask({ tags: newTags });
      setNewTag('');
      toast.success('Метка добавлена');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = task.tags.filter(tag => tag !== tagToRemove);
    onUpdateTask({ tags: newTags });
    toast.success('Метка удалена');
  };

  const handleAssigneeChange = (userId: string) => {
    onUpdateTask({ assigneeId: userId === 'unassigned' ? null : userId });
    setIsEditingAssignee(false);
    toast.success('Исполнитель изменен');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      urgent: 'Срочный',
      high: 'Высокий', 
      medium: 'Средний',
      low: 'Низкий'
    };
    return labels[priority as keyof typeof labels] || 'Средний';
  };

  return (
    <>
      {/* Sheet Header for Accessibility */}
      <SheetHeader className="sr-only">
        <SheetTitle>Детальный просмотр задачи: {task.title}</SheetTitle>
        <SheetDescription>
          Подробная информация о задаче {task.title}, включая описание, чек-лист, участников и комментарии
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-none border-b p-6">
          <div className="mb-4">
            {isEditingTitle ? (
              <div className="flex gap-2 items-center">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') {
                      setTitle(task.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-xl font-medium"
                  autoFocus
                />
                <Button size="sm" onClick={handleTitleSave}>Сохранить</Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setTitle(task.title);
                    setIsEditingTitle(false);
                  }}
                >
                  Отмена
                </Button>
              </div>
            ) : (
              <h1 
                className="text-xl font-medium text-gray-900 break-words max-w-none cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded"
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
              </h1>
            )}
          </div>
        </div>
      
      {/* Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 min-w-0 max-w-none p-6 space-y-6 overflow-y-auto overflow-x-hidden">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Plus className="size-4 mr-2" />
              Добавить
            </Button>
            <Button variant="outline" size="sm">
              <CheckSquare className="size-4 mr-2" />
              Чек-лист
            </Button>
            <Button variant="outline" size="sm">
              <Paperclip className="size-4 mr-2" />
              Вложение
            </Button>
          </div>

          {/* Participants, Labels, Due Date */}
          <div className="space-y-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:space-y-0">
            {/* Participants */}
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Участники</h3>
              {isEditingAssignee ? (
                <div className="space-y-2">
                  <Select value={task.assigneeId || 'unassigned'} onValueChange={handleAssigneeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите исполнителя" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Не назначен</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback className="text-sm bg-blue-100 text-blue-700">
                          {assignee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignee.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <User className="size-5" />
                      <span className="text-sm">Не назначен</span>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="size-8 p-0"
                    onClick={() => setIsEditingAssignee(true)}
                  >
                    <Settings className="size-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Метки</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      className="bg-green-100 text-green-700 border-green-200 cursor-pointer hover:bg-green-200 group flex items-center gap-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="size-3 opacity-50 group-hover:opacity-100" />
                    </Badge>
                  ))}
                </div>
                {isEditingTags ? (
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag();
                          setIsEditingTags(false);
                        }
                        if (e.key === 'Escape') {
                          setNewTag('');
                          setIsEditingTags(false);
                        }
                      }}
                      placeholder="Название метки"
                      className="h-6 text-xs"
                      autoFocus
                    />
                    <Button size="sm" className="h-6 text-xs" onClick={() => { handleAddTag(); setIsEditingTags(false); }}>
                      Добавить
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => setIsEditingTags(true)}
                  >
                    <Plus className="size-3 mr-1" />
                    Добавить метку
                  </Button>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Срок</h3>
              {isEditingDueDate ? (
                <div className="space-y-2">
                  <DatePicker
                    date={dueDate ? new Date(dueDate) : undefined}
                    onDateChange={(date) => {
                      setDueDate(date ? date.toISOString().split('T')[0] : '');
                    }}
                    placeholder="Выберите дату"
                    className="h-8 text-xs"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-xs" onClick={handleDueDateSave}>
                      Сохранить
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs"
                      onClick={() => {
                        setDueDate(task.dueDate);
                        setIsEditingDueDate(false);
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {task.dueDate ? (
                    <Badge 
                      variant={isOverdue ? "destructive" : "secondary"}
                      className={`${
                        isOverdue 
                          ? 'bg-red-100 text-red-700 border-red-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      } flex items-center gap-1 max-w-full cursor-pointer hover:bg-opacity-80`}
                      onClick={() => setIsEditingDueDate(true)}
                    >
                      <Calendar className="size-3 flex-shrink-0" />
                      <span className="truncate">{formatDate(task.dueDate)}</span>
                      {isOverdue && <span className="ml-1 text-red-600 font-medium flex-shrink-0">Просрочен</span>}
                    </Badge>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={() => setIsEditingDueDate(true)}
                    >
                      <Calendar className="size-3 mr-1" />
                      Добавить срок
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Settings className="size-4" />
              Описание
            </h3>
            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Добавьте более подробное описание..."
                  rows={4}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDescriptionSave}>
                    Сохранить
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setDescription(task.description || '');
                      setIsEditingDescription(false);
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 min-h-[80px] flex items-center"
                onClick={() => setIsEditingDescription(true)}
              >
                {task.description ? (
                  <p className="text-sm text-gray-900">{task.description}</p>
                ) : (
                  <p className="text-sm text-gray-500">Добавьте более подробное описание...</p>
                )}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CheckSquare className="size-4" />
                Чек-лист
              </h3>
              {totalTasks > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => {
                      const allCompleted = checklist.every(item => item.completed);
                      const newChecklist = checklist.map(item => ({ 
                        ...item, 
                        completed: !allCompleted 
                      }));
                      setChecklist(newChecklist);
                      onUpdateTask({ checklist: newChecklist });
                    }}
                  >
                    {checklist.every(item => item.completed) ? 'Скрыть отмеченные пункты' : 'Удалить'}
                  </Button>
                </div>
              )}
            </div>

            {totalTasks > 0 && (
              <div className="mb-4">
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="space-y-2">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 group p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                  />
                  <span className={`flex-1 text-sm break-words ${
                    item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => removeChecklistItem(item.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2 mt-3">
                <Input
                  placeholder="Добавить элемент"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addChecklistItem();
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={addChecklistItem} 
                  disabled={!newChecklistItem.trim()}
                  size="sm"
                >
                  Добавить
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                onDeleteTask();
                toast.success('Карточка удалена');
              }}
            >
              <Trash2 className="size-4 mr-2" />
              Удалить карточку
            </Button>
          </div>
        </div>

        {/* Sidebar - Activity & Comments */}
        <div className="w-96 flex-none border-l bg-gray-50 p-4 space-y-4 overflow-y-auto overflow-x-hidden">
          <div>
            <h3 className="font-medium text-gray-900">Комментарии и события</h3>
          </div>

          {/* Add Comment */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Avatar className="size-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {currentUser?.name 
                    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Напишите комментарий..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="w-full text-sm"
                />
                {newComment.trim() && (
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={async () => {
                      if (!newComment.trim() || !task.id) return;
                      
                      try {
                        // Получаем текущего пользователя
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) {
                          toast.error('Необходимо войти в систему');
                          return;
                        }

                        // Сохраняем комментарий в БД
                        await supabaseKanbanService.addTaskComment(task.id, newComment.trim(), user.id);
                        
                        // Обновляем задачу, чтобы получить обновленные комментарии
                        const updatedTask = await supabaseKanbanService.getTask(task.id);
                        
                        // Трансформируем комментарии из формата БД в формат фронтенда
                        const transformedComments = (updatedTask.comments || []).map((comment: any) => ({
                          id: comment.id,
                          text: comment.content || comment.text,
                          authorId: comment.author_id || comment.authorId,
                          createdAt: comment.created_at || comment.createdAt,
                          updatedAt: comment.updated_at || comment.updatedAt
                        }));
                        
                        // Обновляем через onUpdateTask
                        onUpdateTask({
                          comments: transformedComments
                        });
                        
                        setNewComment('');
                        toast.success('Комментарий добавлен');
                      } catch (error: any) {
                        console.error('Failed to add comment:', error);
                        toast.error(`Ошибка добавления комментария: ${error.message || 'Неизвестная ошибка'}`);
                      }
                    }}
                  >
                    Отправить
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-3">
            {task.comments && task.comments.length > 0 && task.comments.map((comment) => {
              // Находим автора комментария
              const commentAuthor = users.find(u => u.id === comment.authorId) || null;
              const authorInitials = commentAuthor 
                ? commentAuthor.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : 'U';
              
              return (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={commentAuthor?.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {commentAuthor?.name || 'Неизвестный пользователь'}
                      </p>
                      <p className="text-sm text-gray-900 break-words">{comment.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Activity items */}
            <div className="flex items-start gap-2">
              <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="size-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Илья Фоминцев</span> добавил(а) эту карточку в список{' '}
                  <span className="font-medium">{currentColumn?.title}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}