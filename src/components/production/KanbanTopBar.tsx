import React from 'react';
import { MessageSquare, MoreVertical, Grid3x3, Plus } from 'lucide-react';

type ViewMode = 'board' | 'gantt';

interface KanbanTopBarProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function KanbanTopBar({ view, onViewChange }: KanbanTopBarProps) {
  return (
    <div className="bg-transparent">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-green-500">
            <span className="text-xs text-white">G</span>
          </div>
          <span className="font-medium">Проект "Buro dsgn"</span>
        </div>

        <button className="rounded p-1 hover:bg-gray-100">
          <MoreVertical className="h-4 w-4 text-gray-600" />
        </button>

        <div className="flex items-center gap-2 text-gray-600">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">Чат проекта</span>
        </div>

        <div className="ml-auto" />
      </div>

      <div className="flex items-center gap-2 bg-transparent px-4 py-2">
        <button
          className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${
            view === 'board' ? 'bg-blue-500 text-white' : 'bg-white/70 text-foreground'
          }`}
          onClick={() => onViewChange('board')}
        >
          <Grid3x3 className="h-3 w-3" />
          Доска
        </button>
        <button
          className={`rounded px-3 py-1 text-sm ${
            view === 'gantt' ? 'bg-blue-500 text-white' : 'bg-white/70 text-foreground'
          }`}
          onClick={() => onViewChange('gantt')}
        >
          Гант
        </button>
        <button className="rounded bg-white px-3 py-1 text-sm hover:bg-gray-100">Календарь</button>
        <button className="flex items-center gap-1 rounded bg-white px-3 py-1 text-sm hover:bg-gray-100">
          <div className="h-4 w-4 rounded-full bg-gray-300"></div>
          Исполнители
          <span className="rounded bg-gray-200 px-1.5 text-xs">2</span>
        </button>
        <button className="flex items-center gap-1 rounded bg-white px-3 py-1 text-sm hover:bg-gray-100">
          Документы
          <span className="rounded bg-gray-200 px-1.5 text-xs">2</span>
        </button>
        <button className="flex items-center gap-1 rounded bg-white px-3 py-1 text-sm hover:bg-gray-100">
          <div className="h-2 w-2 rounded-full bg-orange-500"></div>
          Просрочен
        </button>
        <button className="rounded bg-white px-3 py-1 text-sm hover:bg-gray-100">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}


