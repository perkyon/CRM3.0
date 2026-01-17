import React from 'react';
import {
  Plus,
  MoreVertical,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  Paperclip,
  X
} from 'lucide-react';
import { useUsers } from '../../lib/hooks/useUsers';
import { KanbanTopBar } from './KanbanTopBar';

type Priority = 'low' | 'medium' | 'high';
type ViewMode = 'board' | 'gantt';

type Task = {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  deadline?: string;
  priority?: Priority;
  tags?: string[];
  hasSubtasks?: boolean;
  subtaskCount?: number;
  subtaskDone?: number;
  color?: string;
  done?: boolean;
  order?: number;
  checklist?: ChecklistItem[];
  comments?: TaskComment[];
  attachments?: Attachment[];
};

type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

type TaskComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

type Attachment = {
  id: string;
  name: string;
  size: number;
};

type Column = {
  id: string;
  title: string;
  titleEn: string;
  color: string;
  tasks: Task[];
};

const baseColumns: Column[] = [
  { id: 'backlog', title: 'Backlog — Все компоненты', titleEn: 'Backlog', color: '#e5e7eb', tasks: [] },
  { id: 'inprogress', title: 'В работе — Исполнители', titleEn: 'In progress', color: '#fef3c7', tasks: [] },
  { id: 'review', title: 'Проверка — Начальник цеха', titleEn: 'Review', color: '#fef9c3', tasks: [] },
  { id: 'done', title: 'Готово — Принято', titleEn: 'Done', color: '#dcfce7', tasks: [] }
];

const defaultTasks: Task[] = [
  {
    id: 't1',
    title: 'Сделать корпус панели',
    assignee: undefined,
    deadline: '2024-12-25',
    priority: 'high',
    tags: ['корпус'],
    hasSubtasks: true,
    subtaskCount: 4,
    subtaskDone: 2,
    checklist: [
      { id: 'c1', text: 'Закупить металл', done: true },
      { id: 'c2', text: 'Сделать раскрой', done: false },
      { id: 'c3', text: 'Проверить качество', done: false }
    ],
    comments: [
      { id: 'cm1', author: 'Илья', text: 'Проверь дату поставки', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 't2',
    title: 'Подготовить проводку',
    assignee: undefined,
    deadline: '2024-12-22',
    priority: 'medium',
    tags: ['провод'],
    hasSubtasks: false,
    checklist: [],
    comments: []
  },
  {
    id: 't3',
    title: 'Сборка блока питания',
    assignee: undefined,
    deadline: '2024-12-28',
    priority: 'high',
    tags: ['сборка'],
    hasSubtasks: true,
    subtaskCount: 4,
    subtaskDone: 3,
    checklist: [
      { id: 'c4', text: 'Согласовать схему', done: true },
      { id: 'c5', text: 'Собрать макет', done: true },
      { id: 'c6', text: 'Проверить тесты', done: false }
    ],
    comments: []
  }
];

const priorityColors: Record<Priority, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444'
};

// компактная палитра тегов/цветов задачи (6 тонов вместо 9)
const taskPalette = ['#94a3b8', '#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];
const columnPalette = ['#e5e7eb', '#fef3c7', '#fef9c3', '#dcfce7', '#cffafe', '#e0e7ff', '#ffe4e6'];
const protectedColumns = ['backlog', 'inprogress', 'review', 'done'];
const mockUsers = ['Илья Фоминцев', 'Анна Смирнова', 'Дмитрий Иванов', 'Сергей Петров', 'Алина Ким'];
const getInitials = (name?: string, email?: string) => {
  const src = name || email || 'У';
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
};

const ganttFallback = [
  { id: 'g1', title: 'Сделать корпус панели', start: 0, duration: 4, color: '#4f46e5' },
  { id: 'g2', title: 'Подготовить проводку', start: 2, duration: 3, color: '#2563eb' },
  { id: 'g3', title: 'Сборка блока питания', start: 5, duration: 4, color: '#f59e0b' }
];

export function SimpleKanbanBoard() {
  const [view, setView] = React.useState<ViewMode>('board');
  const [columns, setColumns] = React.useState<Column[]>(() => {
    const preset = baseColumns.map((c, idx) =>
      idx === 0 ? { ...c, tasks: defaultTasks } : { ...c, tasks: [] }
    );
    return preset;
  });
  const [openTaskMenu, setOpenTaskMenu] = React.useState<string | null>(null);
  const [openColumnMenu, setOpenColumnMenu] = React.useState<string | null>(null);
  const [newTaskTitles, setNewTaskTitles] = React.useState<Record<string, string>>({});
  const [dragTask, setDragTask] = React.useState<{ taskId: string; fromColumnId: string } | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<{ columnId: string; taskId: string } | null>(null);
  const [modalChecklistDraft, setModalChecklistDraft] = React.useState('');
  const [modalCommentDraft, setModalCommentDraft] = React.useState('');
  const [hideCheckedItems, setHideCheckedItems] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [assigneeSearch, setAssigneeSearch] = React.useState('');
  const [selectedAssignee, setSelectedAssignee] = React.useState<string | undefined>(undefined);
  const [deadlineValue, setDeadlineValue] = React.useState<string>('');
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = React.useState(false);
  const { users: orgUsers } = useUsers();

  React.useEffect(() => {
    const handleClick = () => {
      setOpenTaskMenu(null);
      setOpenColumnMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const addTaskToColumn = (columnId: string, titleOverride?: string) => {
    const title = (titleOverride ?? newTaskTitles[columnId])?.trim();
    if (!title) return;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: [
                ...col.tasks,
                {
                  id: `task-${Date.now()}`,
                  title,
                  priority: 'medium',
                  order: col.tasks.length,
                  hasSubtasks: false,
                  subtaskCount: 0,
                  subtaskDone: 0,
                  checklist: [],
                  comments: [],
                  attachments: []
                }
              ]
            }
          : col
      )
    );
    setNewTaskTitles((prev) => ({ ...prev, [columnId]: '' }));
  };

  const addColumn = (title: string, color: string = columnPalette[0]) => {
    if (!title.trim()) return;
    setColumns((prev) => [
      ...prev,
      {
        id: `col-${Date.now()}`,
        title,
        titleEn: title,
        color,
        tasks: []
      }
    ]);
  };

  const updateTask = (columnId: string, taskId: string, updater: (task: Task) => Task | null) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: col.tasks
                .map((task) => (task.id === taskId ? updater(task) : task))
                .filter(Boolean) as Task[]
            }
          : col
      )
    );
  };

  const duplicateTask = (columnId: string, task: Task) => {
    const copyId = `${task.id}-copy-${Date.now()}`;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, { ...task, id: copyId, title: `${task.title} (копия)` }] }
          : col
      )
    );
  };

  const setTaskColor = (columnId: string, taskId: string, color: string) => {
    updateTask(columnId, taskId, (task) => ({ ...task, color }));
  };

  const setTaskTags = (columnId: string, taskId: string) => {
    const next = prompt('Теги через запятую?');
    if (next === null) return;
    const tags = next
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateTask(columnId, taskId, (task) => ({ ...task, tags }));
  };

  const toggleTaskDone = (columnId: string, taskId: string) => {
    updateTask(columnId, taskId, (task) => ({ ...task, done: !task.done }));
  };

  const deleteTask = (columnId: string, taskId: string) => {
    updateTask(columnId, taskId, () => null);
  };

  const currentTask = React.useMemo(() => {
    if (!selectedTask) return null;
    const column = columns.find((c) => c.id === selectedTask.columnId);
    const task = column?.tasks.find((t) => t.id === selectedTask.taskId);
    return task ? { column, task } : null;
  }, [columns, selectedTask]);

  React.useEffect(() => {
    if (currentTask) {
      setSelectedAssignee(currentTask.task.assignee);
      setDeadlineValue(currentTask.task.deadline || '');
    }
  }, [currentTask]);

  const addChecklistItem = (columnId: string, taskId: string, text: string) => {
    if (!text.trim()) return;
    updateTask(columnId, taskId, (t) => ({
      ...t,
      checklist: [...(t.checklist || []), { id: `chk-${Date.now()}`, text: text.trim(), done: false }]
    }));
    setModalChecklistDraft('');
  };

  const toggleChecklistItem = (columnId: string, taskId: string, itemId: string) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          tasks: col.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const checklist = (task.checklist || []).map((c) =>
              c.id === itemId ? { ...c, done: !c.done } : c
            );
            const subtaskCount = checklist.length;
            const subtaskDone = checklist.filter((c) => c.done).length;
            return { ...task, checklist, subtaskCount, subtaskDone, hasSubtasks: subtaskCount > 0 };
          })
        };
      })
    );
  };

  const addComment = (columnId: string, taskId: string, text: string) => {
    if (!text.trim()) return;
    updateTask(columnId, taskId, (t) => {
      const comments = [
        ...(t.comments || []),
        { id: `cm-${Date.now()}`, author: 'Вы', text: text.trim(), createdAt: new Date().toISOString() }
      ];
      return { ...t, comments };
    });
    setModalCommentDraft('');
  };

  const addTag = (columnId: string, taskId: string, tag: string) => {
    if (!tag.trim()) return;
    updateTask(columnId, taskId, (t) => ({
      ...t,
      tags: [...(t.tags || []), tag.trim()]
    }));
  };

  const addAttachment = (columnId: string, taskId: string, files: FileList | null) => {
    if (!files || !files.length) return;
    const attachments: Attachment[] = Array.from(files).map((f) => ({
      id: `att-${Date.now()}-${f.name}`,
      name: f.name,
      size: f.size
    }));
    updateTask(columnId, taskId, (t) => ({
      ...t,
      attachments: [...(t.attachments || []), ...attachments]
    }));
  };

  React.useEffect(() => {
    if (!selectedTask) return;
    const column = columns.find((c) => c.id === selectedTask.columnId);
    const task = column?.tasks.find((t) => t.id === selectedTask.taskId);
    if (task) {
      setSelectedAssignee(task.assignee);
      setAssigneeSearch(task.assignee || '');
      setDeadlineValue(task.deadline || '');
    }
  }, [selectedTask, columns]);

  const renameTask = (columnId: string, taskId: string) => {
    const next = prompt('Новое название задачи?');
    if (!next) return;
    updateTask(columnId, taskId, (task) => ({ ...task, title: next }));
  };

  const moveTask = (fromColumnId: string, toColumnId: string, task: Task) => {
    if (fromColumnId === toColumnId) return;
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === fromColumnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        }
        if (col.id === toColumnId) {
          return { ...col, tasks: [...col.tasks, { ...task }] };
        }
        return col;
      })
    );
  };

  const renameColumn = (columnId: string) => {
    const next = prompt('Новое название колонки?');
    if (!next) return;
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, title: next, titleEn: next } : col)));
  };

  const archiveAllTasks = (columnId: string, onlyDone?: boolean) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: onlyDone ? col.tasks.filter((t) => !t.done) : [] }
          : col
      )
    );
  };

  const deleteColumn = (columnId: string) => {
    if (protectedColumns.includes(columnId)) {
      alert('Базовые колонки нельзя удалить');
      return;
    }
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  const duplicateColumn = (column: Column) => {
    const copyId = `${column.id}-copy-${Date.now()}`;
    setColumns((prev) => [
      ...prev,
      {
        ...column,
        id: copyId,
        title: `${column.title} копия`,
        titleEn: `${column.titleEn} copy`,
        tasks: column.tasks.map((t) => ({ ...t, id: `${t.id}-copy-${Date.now()}` }))
      }
    ]);
  };

  const setColumnColor = (columnId: string, color: string) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, color } : col)));
  };

  const ganttData = React.useMemo(() => {
    const tasks: Task[] = columns.flatMap((c) => c.tasks);
    const withDeadline = tasks.filter((t) => t.deadline);
    if (!withDeadline.length) return ganttFallback;
    return withDeadline.map((t, idx) => {
      const diffDays = Math.max(0, Math.round((new Date(t.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      return {
        id: t.id,
        title: t.title,
        start: diffDays,
        duration: 2 + (idx % 3),
        color: t.color || '#4f46e5'
      };
    });
  }, [columns]);

  const renderPriority = (priority?: Priority) => {
    if (!priority) return null;
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <AlertTriangle className="h-3 w-3" style={{ color: priorityColors[priority] }} />
        {priority === 'high' ? 'Высокий' : priority === 'medium' ? 'Средний' : 'Низкий'}
      </span>
    );
  };

  return (
    <>
      <div className="flex h-full min-h-screen bg-white">
        <div className="flex flex-1 flex-col overflow-hidden">
          <KanbanTopBar view={view} onViewChange={setView} />

        <div className="flex-1 overflow-x-auto p-4">
          {view === 'board' ? (
            <div className="flex h-full items-start gap-4">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="relative flex w-[280px] flex-shrink-0 flex-col rounded-xl border shadow-sm"
                  style={{
                    backgroundColor: column.color || '#f8fafc',
                    borderColor: column.color || '#e2e8f0'
                  }}
                >
                  <div
                    className="rounded-t-xl border-b px-3 py-2"
                    style={{
                      backgroundColor: column.color || '#f8fafc',
                      borderColor: column.color || '#e2e8f0'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-slate-800" style={{ color: '#0f172a' }}>
                        {column.title}
                      </h3>
                        <span className="text-xs text-slate-500" style={{ color: '#475569' }}>
                          {column.tasks.length} задач
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenColumnMenu((prev) => (prev === column.id ? null : column.id));
                          setOpenTaskMenu(null);
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {openColumnMenu === column.id && (
                    <div
                      className="absolute right-2 top-14 z-50 w-72 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-1 text-sm text-foreground">
                        <button className="flex w-full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100" onClick={() => renameColumn(column.id)}>
                          Переименовать
                        </button>
                        <button className="flex w/full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100" onClick={() => archiveAllTasks(column.id, false)}>
                          Архивировать все задачи
                        </button>
                        <button className="flex w/full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100" onClick={() => archiveAllTasks(column.id, true)}>
                          Архивировать выполненные
                        </button>
                        <button className="flex w/full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100" onClick={() => duplicateColumn(column)}>
                          Дублировать
                        </button>
                        <div className="border-t border-gray-200 pt-2">
                          <div className="mb-2 text-xs text-muted-foreground">Цвет колонки</div>
                          <div className="flex flex-wrap gap-2">
                            {columnPalette.map((c) => (
                              <button
                                key={c}
                                className="h-6 w-6 rounded-full ring-1 ring-black/10"
                                style={{ backgroundColor: c }}
                                onClick={() => setColumnColor(column.id, c)}
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          className="mt-2 flex w/full items-center gap-2 rounded px-2 py-2 text-red-600 hover:bg-red-50"
                          onClick={() => deleteColumn(column.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className="space-y-2 overflow-visible px-3 py-3"
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!dragTask) return;
                      const sourceTask = columns
                        .find((c) => c.id === dragTask.fromColumnId)
                        ?.tasks.find((t) => t.id === dragTask.taskId);
                      if (!sourceTask) return;
                      setColumns((prev) => {
                        let moving: Task | null = null;
                        const cleaned = prev.map((col) => {
                          if (col.id === dragTask.fromColumnId) {
                            const rest = col.tasks.filter((t) => t.id !== dragTask.taskId);
                            const found = col.tasks.find((t) => t.id === dragTask.taskId) || null;
                            moving = found ? { ...found } : null;
                            return { ...col, tasks: rest };
                          }
                          return col;
                        });
                        if (!moving) return prev;
                        return cleaned.map((col) =>
                          col.id === column.id ? { ...col, tasks: [...col.tasks, { ...moving! }] } : col
                        );
                      });
                      setDragTask(null);
                    }}
                  >
                    {column.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="relative cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                        draggable
                        onClick={() => {
                          setSelectedTask({ columnId: column.id, taskId: task.id });
                          setOpenTaskMenu(null);
                          setOpenColumnMenu(null);
                        }}
                        onDragStart={() => setDragTask({ taskId: task.id, fromColumnId: column.id })}
                        onDragEnd={() => setDragTask(null)}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (!dragTask) return;
                          const sourceTask = columns
                            .find((c) => c.id === dragTask.fromColumnId)
                            ?.tasks.find((t) => t.id === dragTask.taskId);
                          if (!sourceTask) return;

                          setColumns((prev) => {
                            let moving: Task | null = null;
                            const cleaned = prev.map((col) => {
                              if (col.id === dragTask.fromColumnId) {
                                const rest = col.tasks.filter((t) => t.id !== dragTask.taskId);
                                const found = col.tasks.find((t) => t.id === dragTask.taskId) || null;
                                moving = found ? { ...found } : null;
                                return { ...col, tasks: rest };
                              }
                              return col;
                            });
                            if (!moving) return prev;

                            return cleaned.map((col) => {
                              if (col.id === column.id) {
                                const idx = col.tasks.findIndex((t) => t.id === task.id);
                                const nextTasks = [...col.tasks];
                                nextTasks.splice(idx >= 0 ? idx : nextTasks.length, 0, { ...moving! });
                                return { ...col, tasks: nextTasks };
                              }
                              return col;
                            });
                          });
                          setDragTask(null);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                {task.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: task.color }} />}
                                <span className={`text-sm font-semibold text-slate-800 ${task.done ? 'line-through text-slate-400' : ''}`}>
                                {task.title}
                              </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenTaskMenu((prev) => (prev === task.id ? null : task.id));
                                  setOpenColumnMenu(null);
                                }}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              {task.assignee && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {task.assignee}
                                </span>
                              )}
                              {task.deadline && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {task.deadline}
                                </span>
                              )}
                              {renderPriority(task.priority)}
                              {task.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600"
                                >
                                  <Tag className="h-3 w-3" />
                                  {tag}
                                </span>
                              ))}
                        </div>

                            {task.hasSubtasks && typeof task.subtaskCount === 'number' && typeof task.subtaskDone === 'number' && task.subtaskCount > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex-1 rounded-full bg-slate-100">
                                  <div
                                    className="h-1.5 rounded-full bg-emerald-500"
                                    style={{ width: `${Math.min(100, (task.subtaskDone / task.subtaskCount) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  {task.subtaskDone}/{task.subtaskCount}
                              </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {openTaskMenu === task.id && (
                          <div
                            className="absolute right-2 top-8 z-50 w-72 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-1 text-sm text-foreground">
                              <button
                                className="flex w-full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
                                onClick={() => toggleTaskDone(column.id, task.id)}
                              >
                                Отметить выполненной
                              </button>
                              <button
                                className="flex w/full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
                                onClick={() => renameTask(column.id, task.id)}
                              >
                                Переименовать
                              </button>
                              <button
                                className="flex w/full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
                                onClick={() => setTaskTags(column.id, task.id)}
                              >
                                Теги
                              </button>
                              <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1">
                                  {taskPalette.map((c) => (
                                    <button
                                      key={c}
                                      className="h-6 w-6 rounded-full ring-1 ring-black/10"
                                      style={{ backgroundColor: c }}
                                      onClick={() => setTaskColor(column.id, task.id, c)}
                                    />
                                  ))}
                                </div>
                              <button
                                className="flex w/full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
                                onClick={() => duplicateTask(column.id, task)}
                              >
                                Дублировать
                              </button>
                              <button
                                className="flex w/full items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
                                onClick={() => deleteTask(column.id, task.id)}
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const title = (prompt('Название карточки?') || '').trim();
                        if (!title) return;
                        addTaskToColumn(column.id, title);
                      }}
                      className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      <Plus className="h-4 w-4" />
                      Добавить карточку
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const title = prompt('Название колонки?')?.trim();
                  if (!title) return;
                  addColumn(title);
                }}
                className="flex h-12 w-[280px] flex-shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Добавьте ещё одну колонку
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col gap-4 rounded-xl bg-white/60 p-4 shadow-sm backdrop-blur">
              <div className="grid grid-cols-10 gap-2 text-xs text-muted-foreground">
                {[...Array(10)].map((_, idx) => (
                  <div key={idx} className="text-center">
                    День {idx + 1}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {ganttData.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <span className="w-64 text-sm text-foreground">{task.title}</span>
                    <div className="relative h-3 flex-1 rounded bg-gray-200">
                      <div
                        className="absolute inset-y-0 rounded"
                        style={{
                          left: `${task.start * 5}%`,
                          width: `${task.duration * 5}%`,
                          backgroundColor: task.color,
                          boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {currentTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6" onClick={() => setSelectedTask(null)}>
          <div
            className="relative flex w-full max-w-4xl flex-col gap-4 rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <select
                  className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-800"
                  value={currentTask.column!.id}
                  onChange={(e) => {
                    const toColumn = e.target.value;
                    const found = currentTask.column!.tasks.find((t) => t.id === currentTask.task.id);
                    if (!found) return;
                    moveTask(currentTask.column!.id, toColumn, found);
                    setSelectedTask({ columnId: toColumn, taskId: currentTask.task.id });
                  }}
                >
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded bg-slate-100 px-3 py-1 text-sm text-slate-600 hover:bg-slate-200" onClick={() => setSelectedTask(null)}>
                  Закрыть
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-4 md:col-span-2">
                <div className="flex flex-col gap-2">
                  <input
                    className="w-full text-2xl font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentTask.task.title}
                    onChange={(e) =>
                      updateTask(currentTask.column!.id, currentTask.task.id, (t) => ({ ...t, title: e.target.value }))
                    }
                    placeholder="Название карточки"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <button
                      className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                      onClick={() => {
                        const next = prompt('Новый пункт или описание?');
                        if (next) addChecklistItem(currentTask.column!.id, currentTask.task.id, next);
                      }}
                    >
                      + Добавить
                    </button>
                    <button
                      className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                      onClick={() => {}}
                    >
                      <Calendar className="h-3 w-3" /> Даты
                    </button>
                    <button
                      className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                      onClick={() => {
                        const next = prompt('Новый пункт чек-листа?');
                        if (next) addChecklistItem(currentTask.column!.id, currentTask.task.id, next);
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Чек-лист
                    </button>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => addAttachment(currentTask.column!.id, currentTask.task.id, e.target.files)}
                      />
                      <button
                        className="flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-3 w-3" /> Вложение
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col gap-1 relative">
                    <span className="text-xs uppercase text-slate-400">Участники</span>
                    <div className="flex items-center gap-2">
                      <div className="relative w-56">
                        <button
                          onClick={() => setAssigneeDropdownOpen((p) => !p)}
                          className="flex h-9 w-full items-center justify-between rounded border border-slate-300 px-3 text-sm text-slate-700 hover:border-blue-500 focus:border-blue-500 focus:outline-none"
                        >
                          <span className="flex items-center gap-2">
                            <span className="flex h-6 w-6 min-h-[24px] min-w-[24px] items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                              {getInitials(selectedAssignee || '', selectedAssignee || '')}
                            </span>
                            <span>{selectedAssignee || 'Выберите исполнителя'}</span>
                          </span>
                          <span className="text-slate-400">▾</span>
                        </button>
                        {assigneeDropdownOpen && (
                          <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                            <div className="p-2">
                              <input
                                className="h-8 w-full rounded border border-slate-200 px-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                placeholder="Поиск..."
                                value={assigneeSearch}
                                onChange={(e) => setAssigneeSearch(e.target.value)}
                              />
                            </div>
                            <div className="max-h-56 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                              {orgUsers
                                .filter((u) =>
                                  (u.name || u.email || '')
                                    .toLowerCase()
                                    .includes(assigneeSearch.toLowerCase())
                                )
                                .map((u) => (
                                  <button
                                    key={u.id}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                                    onClick={() => {
                                      const name = u.name || u.email || '';
                                      setSelectedAssignee(name);
                                      setAssigneeSearch(name);
                                      setAssigneeDropdownOpen(false);
                                      updateTask(currentTask.column!.id, currentTask.task.id, (t) => ({ ...t, assignee: name }));
                                    }}
                                  >
                                    <div className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                                      {getInitials(u.name, u.email)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-slate-800">{u.name || 'Без имени'}</span>
                                      {u.email && <span className="text-xs text-slate-500">{u.email}</span>}
                                    </div>
                                  </button>
                                ))}
                              {!orgUsers.length && (
                                <div className="px-3 py-2 text-xs text-slate-500">Нет пользователей организации</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase text-slate-400">Метки</span>
                    <div className="flex items-center gap-2">
                      {currentTask.task.tags?.map((tag) => (
                        <span key={tag} className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                          {tag}
                        </span>
                      ))}
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-50"
                        onClick={() => addTag(currentTask.column!.id, currentTask.task.id, prompt('Метка?') || '')}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase text-slate-400">Дедлайн</span>
                    <input
                      type="date"
                      className="h-9 rounded border border-slate-300 px-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      value={deadlineValue}
                      onChange={(e) => {
                        setDeadlineValue(e.target.value);
                        updateTask(currentTask.column!.id, currentTask.task.id, (t) => ({ ...t, deadline: e.target.value || undefined }));
                      }}
                    />
                  </div>
                </div>

                {currentTask.task.attachments && currentTask.task.attachments.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
                    <div className="text-sm font-semibold text-slate-700">Вложения</div>
                    <div className="space-y-1 text-sm text-slate-700">
                      {currentTask.task.attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-slate-500" />
                          <span>{att.name}</span>
                          <span className="text-xs text-slate-500">{(att.size / 1024).toFixed(1)} КБ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">Описание</div>
                    <button className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">Изменить</button>
                  </div>
                  <textarea
                    className="min-h-[100px] rounded border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Добавить более подробное описание..."
                    value={currentTask.task.description || ''}
                    onChange={(e) =>
                      updateTask(currentTask.column!.id, currentTask.task.id, (t) => ({ ...t, description: e.target.value }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">Чек-лист</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {currentTask.task.checklist && currentTask.task.checklist.length
                          ? Math.round(((currentTask.task.checklist.filter((i) => i.done).length) / currentTask.task.checklist.length) * 100)
                          : 0}
                        %
                      </span>
                      <button
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                        onClick={() => setHideCheckedItems((p) => !p)}
                      >
                        {hideCheckedItems ? 'Показать отмеченные' : 'Скрывать отмеченные пункты'}
                      </button>
                      <button
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => updateTask(currentTask.column!.id, currentTask.task.id, (t) => ({ ...t, checklist: [], subtaskCount: 0, subtaskDone: 0, hasSubtasks: false }))}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-200">
                    <div
                      className="h-2 rounded bg-emerald-500"
                      style={{
                        width: `${
                          currentTask.task.checklist && currentTask.task.checklist.length
                            ? Math.round(((currentTask.task.checklist.filter((i) => i.done).length) / currentTask.task.checklist.length) * 100)
                            : 0
                        }%`
                      }}
                    ></div>
                  </div>
                  <div className="space-y-2">
                    {(currentTask.task.checklist || [])
                      .filter((item) => (hideCheckedItems ? !item.done : true))
                      .map((item) => (
                        <label key={item.id} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                            checked={item.done}
                            onChange={() => toggleChecklistItem(currentTask.column!.id, currentTask.task.id, item.id)}
                          />
                          <span className={item.done ? 'line-through text-slate-400' : ''}>{item.text}</span>
                        </label>
                      ))}
                    <div className="flex items-center gap-2">
                      <input
                        className="h-9 flex-1 rounded border border-slate-200 px-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Добавить элемент"
                        value={modalChecklistDraft}
                        onChange={(e) => setModalChecklistDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addChecklistItem(currentTask.column!.id, currentTask.task.id, modalChecklistDraft);
                          }
                        }}
                      />
                      <button
                        className="rounded border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => addChecklistItem(currentTask.column!.id, currentTask.task.id, modalChecklistDraft)}
                      >
                        Добавить элемент
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-semibold text-slate-700">Комментарии и события</div>
                  <textarea
                    className="min-h-[80px] rounded border border-slate-200 p-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Напишите комментарий..."
                    value={modalCommentDraft}
                    onChange={(e) => setModalCommentDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addComment(currentTask.column!.id, currentTask.task.id, modalCommentDraft);
                      }
                    }}
                  />
                  <button
                    className="self-start rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-900"
                    onClick={() => addComment(currentTask.column!.id, currentTask.task.id, modalCommentDraft)}
                  >
                    Добавить
                  </button>
                  <div className="space-y-2">
                    {(currentTask.task.comments || []).map((c) => (
                      <div key={c.id} className="rounded border border-slate-200 p-2 text-sm text-slate-700">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                            {c.author.slice(0, 2)}
                          </div>
                          <span>{c.author}</span>
                        </div>
                        <div className="mt-1 text-slate-800">{c.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function KanbanShowcase() {
  return <SimpleKanbanBoard />;
}

export default KanbanShowcase;

// Карточка модалки

