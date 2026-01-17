import React from 'react';
import {
  User,
  ListTodo,
  Building2,
  Plus,
  MessageSquare,
  MessageCircle,
  Activity,
  FileText,
  TrendingUp,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Star
} from 'lucide-react';

export function KanbanSidebar() {
  return (
    <div className="flex h-full w-[200px] flex-col border-r border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="border-b border-gray-200 p-3">
        <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
            <User className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm">Мой профиль</span>
          <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
            <ListTodo className="h-4 w-4 text-gray-600" />
            <span className="text-sm">Мои задачи</span>
            <span className="ml-auto text-xs text-gray-500">2</span>
          </div>

          <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
            <Building2 className="h-4 w-4 text-gray-600" />
            <span className="text-sm">Моя компания</span>
          </div>

          <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-gray-400 hover:bg-gray-100">
            <Plus className="h-4 w-4" />
            <span className="text-sm">Добавить проект</span>
          </div>

          <div className="mt-1 flex cursor-pointer items-center gap-2 rounded bg-orange-50 px-2 py-2">
            <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
            <span className="text-sm">Buro dsgn</span>
          </div>

          <div className="mt-4">
            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <MessageCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Мессенджер</span>
            </div>

            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Личные чаты</span>
            </div>

            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-gray-400 hover:bg-gray-100">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Создать групповой чат</span>
            </div>

            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Футуристка</span>
              <span className="ml-auto text-xs text-gray-500">1</span>
            </div>

            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Чат Buro dsgn</span>
              <span className="ml-auto text-xs text-gray-500">3</span>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-2">
            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <Activity className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Лента событий</span>
            </div>

            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Отчеты</span>
            </div>

            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Ликвидные и отпатка</span>
            </div>

            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <HelpCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Поддержка, Новости</span>
              <span className="ml-auto rounded bg-red-500 px-1 text-xs text-white">-1</span>
            </div>

            <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-gray-100">
              <Sparkles className="h-4 w-4 text-gray-600" />
              <span className="text-sm">AI-ассистент</span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}


