import React from 'react';
import {
  LayoutDashboard,
  Users,
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
import { mockUsers } from '../../lib/mockData';
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
  { id: 'projects', label: 'Проекты', icon: FolderOpen, permission: 'projects' },
  { id: 'production', label: 'Производство', icon: Package, permission: 'production' },
  { id: 'inventory', label: 'Склад', icon: Warehouse, permission: 'inventory' },
  { id: 'finance', label: 'Финансы', icon: Calculator, permission: 'finance' },
  { id: 'workflow-demo', label: 'Демо Workflow', icon: Play, permission: '' },
  { id: 'settings', label: 'Настройки', icon: Settings, permission: '' },
  { id: 'roles', label: 'Роли', icon: Shield, permission: 'admin' },
  { id: 'integrations', label: 'Интеграции', icon: Plug, permission: 'admin' },
];

export function AppSidebar({ currentPage, onNavigate, collapsed, className }: AppSidebarProps) {
  const currentUser = mockUsers[0]; // Mock current user

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
            const hasAccess = !item.permission || hasPermission(currentUser.role, item.permission);
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  collapsed && "px-2",
                  !hasAccess && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => hasAccess && onNavigate(item.id)}
                disabled={!hasAccess}
                title={!hasAccess ? "Недостаточно прав" : item.label}
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}