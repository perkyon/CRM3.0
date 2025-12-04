import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { AppSidebar } from './AppSidebar';
import { getInitials } from '../../lib/utils';
import { useUserStore } from '../../lib/stores/userStore';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentOrganization } from '../../lib/hooks/useCurrentOrganization';
import { Building2 } from 'lucide-react';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, fetchCurrentUser, fetchUsers } = useUserStore();
  const { logout, isAuthenticated, loading } = useAuth();
  const { currentOrganization } = useCurrentOrganization();
  
  // Fetch current user and all users on mount
  React.useEffect(() => {
    fetchCurrentUser();
    fetchUsers(); // Загружаем всех пользователей для фильтров и т.д.
  }, [fetchCurrentUser, fetchUsers]);
  
  // Защита: редирект на главную если не авторизован
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Загрузка...</span>
        </div>
      </div>
    );
  }
  
  // Если не авторизован - не показываем layout (будет редирект)
  if (!isAuthenticated) {
    return null;
  }
  
  // Получаем текущую страницу из URL (убираем /app префикс)
  const currentPage = location.pathname.replace('/app/', '').split('/')[0] || 'dashboard';
  
  // Функция навигации через React Router (используем /app префикс)
  const handleNavigate = (page: string) => {
    navigate(`/app/${page}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="size-5" />
          </Button>
          <h1 className="text-lg font-medium">Buro CRM</h1>
          {currentOrganization && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border">
              <Building2 className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{currentOrganization.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Поиск клиентов, проектов..."
              className="pl-10 w-80"
            />
          </div>

          <Button variant="ghost" size="sm">
            <Bell className="size-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{getInitials(currentUser?.name || 'User')}</AvatarFallback>
                </Avatar>
                <span className="hidden xl:block">{currentUser?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 size-4" />
                Профиль
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigate('settings')}>
                <Settings className="mr-2 size-4" />
                Настройки
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 size-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0" aria-describedby="nav-sheet-description">
            <SheetDescription id="nav-sheet-description" className="sr-only">
              Боковая панель навигации с основными разделами системы
            </SheetDescription>
            <SheetHeader className="sr-only">
              <SheetTitle>Навигация</SheetTitle>
            </SheetHeader>
            <AppSidebar
              currentPage={currentPage}
              onNavigate={(page) => {
                handleNavigate(page);
                setMobileNavOpen(false);
              }}
              className="border-0"
            />
          </SheetContent>
        </Sheet>
        </div>
        {currentOrganization && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border">
            <Building2 className="size-3 text-muted-foreground" />
            <span className="text-xs font-medium">{currentOrganization.name}</span>
          </div>
        )}

        <h1 className="text-base font-medium">CRM</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Avatar className="size-8">
                <AvatarImage src="" />
                <AvatarFallback>{getInitials(currentUser?.name || 'User')}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Профиль</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate('settings')}>Настройки</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Выйти</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}>
          <AppSidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            collapsed={!sidebarOpen}
            className="h-[calc(100vh-73px)] border-r"
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 h-[calc(100vh-73px)] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}