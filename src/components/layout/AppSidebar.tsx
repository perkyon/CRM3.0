import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderOpen,
  Package,
  Warehouse,
  Calculator,
  Settings,
  Shield,
  Plug,
  Play
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useUserStore } from '../../lib/stores/userStore';
import { hasPermission } from '../../lib/utils';

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed?: boolean;
  className?: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Панель управления', icon: LayoutDashboard, permission: '' },
  { id: 'clients', label: 'Клиенты', icon: Users, permission: 'clients' },
  { id: 'communications', label: 'Сообщения', icon: MessageSquare, permission: 'clients' },
  { id: 'projects', label: 'Проекты', icon: FolderOpen, permission: 'projects' },
  { id: 'production', label: 'Производство', icon: Package, permission: 'production' },
  { id: 'inventory', label: 'Склад', icon: Warehouse, permission: 'inventory' },
  { id: 'finance', label: 'Финансы', icon: Calculator, permission: 'finance' },
  { id: 'settings', label: 'Настройки', icon: Settings, permission: '' },
  { id: 'roles', label: 'Роли', icon: Shield, permission: '' },
  { id: 'integrations', label: 'Интеграции', icon: Plug, permission: '' },
];

export function AppSidebar({ currentPage, onNavigate, collapsed, className }: AppSidebarProps) {
  const { currentUser } = useUserStore();

  return (
    <div className={cn('bg-sidebar border-sidebar-border', className)}>
      <div className="p-4">
        {!collapsed && (
          <div className="mb-6">
            <h2 className="text-sidebar-foreground font-medium">Навигация</h2>
          </div>
        )}

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            // Временно разрешаем доступ ко всем пунктам пока пользователь не загружен
            const hasAccess = !currentUser || !item.permission || hasPermission(currentUser.role, item.permission);
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  collapsed && "px-0 justify-center gap-0",
                  !hasAccess && "opacity-50 cursor-not-allowed",
                  isActive && "bg-primary/5"
                )}
                onClick={() => hasAccess && onNavigate(item.id)}
                disabled={!hasAccess}
                title={!hasAccess ? "Недостаточно прав" : item.label}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl transition-all duration-200",
                    collapsed && "size-11",
                    isActive
                      ? "bg-primary/15 text-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-sm"
                      : "text-sidebar-foreground"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}