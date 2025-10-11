import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Shield, 
  Users, 
  Settings, 
  Lock, 
  Unlock,
  UserPlus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useUserStore } from '../../lib/stores/userStore';
import { User, Role } from '../../types';
import { getInitials } from '../../lib/utils';
import { toast } from '../../lib/toast';

// Определение прав доступа для каждой роли
const ROLE_PERMISSIONS = {
  Admin: {
    label: 'Администратор',
    description: 'Полный доступ ко всем функциям системы',
    color: 'red',
    permissions: [
      'clients_view', 'clients_create', 'clients_edit', 'clients_delete',
      'projects_view', 'projects_create', 'projects_edit', 'projects_delete',
      'production_view', 'production_manage',
      'inventory_view', 'inventory_manage',
      'finance_view', 'finance_manage',
      'users_view', 'users_manage',
      'settings_manage'
    ]
  },
  Manager: {
    label: 'Менеджер',
    description: 'Управление клиентами и проектами',
    color: 'blue',
    permissions: [
      'clients_view', 'clients_create', 'clients_edit',
      'projects_view', 'projects_create', 'projects_edit',
      'production_view',
      'finance_view'
    ]
  },
  Master: {
    label: 'Мастер (Начальник цеха)',
    description: 'Управление производством и материалами',
    color: 'green',
    permissions: [
      'projects_view',
      'production_view', 'production_manage',
      'inventory_view', 'inventory_manage'
    ]
  },
  Procurement: {
    label: 'Закупщик',
    description: 'Управление закупками и складом',
    color: 'purple',
    permissions: [
      'projects_view',
      'inventory_view', 'inventory_manage',
      'suppliers_manage'
    ]
  },
  Accountant: {
    label: 'Бухгалтер',
    description: 'Управление финансами и отчетностью',
    color: 'orange',
    permissions: [
      'clients_view',
      'projects_view',
      'finance_view', 'finance_manage',
      'reports_view'
    ]
  }
} as const;

const PERMISSION_LABELS: Record<string, string> = {
  // Клиенты
  clients_view: 'Просмотр клиентов',
  clients_create: 'Создание клиентов',
  clients_edit: 'Редактирование клиентов',
  clients_delete: 'Удаление клиентов',
  
  // Проекты
  projects_view: 'Просмотр проектов',
  projects_create: 'Создание проектов',
  projects_edit: 'Редактирование проектов',
  projects_delete: 'Удаление проектов',
  
  // Производство
  production_view: 'Просмотр производства',
  production_manage: 'Управление производством',
  
  // Склад
  inventory_view: 'Просмотр склада',
  inventory_manage: 'Управление складом',
  
  // Финансы
  finance_view: 'Просмотр финансов',
  finance_manage: 'Управление финансами',
  
  // Пользователи
  users_view: 'Просмотр пользователей',
  users_manage: 'Управление пользователями',
  
  // Настройки
  settings_manage: 'Управление настройками',
  
  // Другое
  suppliers_manage: 'Управление поставщиками',
  reports_view: 'Просмотр отчетов'
};

const PERMISSION_CATEGORIES = [
  { id: 'clients', label: 'Клиенты', permissions: ['clients_view', 'clients_create', 'clients_edit', 'clients_delete'] },
  { id: 'projects', label: 'Проекты', permissions: ['projects_view', 'projects_create', 'projects_edit', 'projects_delete'] },
  { id: 'production', label: 'Производство', permissions: ['production_view', 'production_manage'] },
  { id: 'inventory', label: 'Склад', permissions: ['inventory_view', 'inventory_manage', 'suppliers_manage'] },
  { id: 'finance', label: 'Финансы', permissions: ['finance_view', 'finance_manage', 'reports_view'] },
  { id: 'system', label: 'Система', permissions: ['users_view', 'users_manage', 'settings_manage'] },
];

export function RolesAndPermissions() {
  const { users, fetchUsers, currentUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Проверка прав администратора
  const isAdmin = currentUser?.role === 'Admin';

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      // TODO: Implement user update API call
      toast.success('Пользователь обновлен');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка при обновлении пользователя');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Lock className="size-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Доступ ограничен</h3>
              <p className="text-muted-foreground">
                Только администраторы могут управлять ролями и правами
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium">Роли и права доступа</h1>
          <p className="text-muted-foreground">Управление правами пользователей системы</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="roles">Роли</TabsTrigger>
          <TabsTrigger value="permissions">Матрица прав</TabsTrigger>
        </TabsList>

        {/* Вкладка: Пользователи */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Пользователи системы</CardTitle>
              <CardDescription>
                Управление ролями и статусом пользователей
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Фильтры */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по имени или email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={(value: Role | 'all') => setSelectedRole(value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Все роли" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все роли</SelectItem>
                    {Object.entries(ROLE_PERMISSIONS).map(([role, config]) => (
                      <SelectItem key={role} value={role}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Таблица пользователей */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ROLE_PERMISSIONS[user.role]?.label || user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.active ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="size-3 mr-1" />
                              Активен
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="size-3 mr-1" />
                              Неактивен
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="size-4 mr-2" />
                            Изменить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Роли */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ROLE_PERMISSIONS).map(([role, config]) => {
              const userCount = users.filter(u => u.role === role).length;
              
              return (
                <Card key={role} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                          <Shield className={`size-5 text-${config.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{config.label}</CardTitle>
                          <CardDescription className="text-xs">
                            {userCount} {userCount === 1 ? 'пользователь' : 'пользователей'}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Права доступа:</div>
                      <div className="flex flex-wrap gap-1">
                        {config.permissions.slice(0, 5).map(permission => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {PERMISSION_LABELS[permission] || permission}
                          </Badge>
                        ))}
                        {config.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{config.permissions.length - 5} еще
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Вкладка: Матрица прав */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Матрица прав доступа</CardTitle>
              <CardDescription>
                Детальная таблица прав для каждой роли
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Раздел / Право</TableHead>
                      {Object.entries(ROLE_PERMISSIONS).map(([role, config]) => (
                        <TableHead key={role} className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Shield className="size-4" />
                            <span className="text-xs">{config.label}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PERMISSION_CATEGORIES.map((category) => (
                      <React.Fragment key={category.id}>
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={6} className="font-medium">
                            {category.label}
                          </TableCell>
                        </TableRow>
                        {category.permissions.map((permission) => (
                          <TableRow key={permission}>
                            <TableCell className="pl-8 text-sm">
                              {PERMISSION_LABELS[permission] || permission}
                            </TableCell>
                            {Object.entries(ROLE_PERMISSIONS).map(([role, config]) => (
                              <TableCell key={role} className="text-center">
                                {config.permissions.includes(permission) ? (
                                  <CheckCircle2 className="size-5 text-green-600 mx-auto" />
                                ) : (
                                  <XCircle className="size-5 text-gray-300 mx-auto" />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог редактирования пользователя */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
            <DialogDescription>
              Изменение роли и статуса пользователя
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="size-12">
                  <AvatarImage src={editingUser.avatar} />
                  <AvatarFallback>{getInitials(editingUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{editingUser.name}</div>
                  <div className="text-sm text-muted-foreground">{editingUser.email}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="role">Роль</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value: Role) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger id="role" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_PERMISSIONS).map(([role, config]) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-muted-foreground">{config.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Статус пользователя</Label>
                  <div className="text-sm text-muted-foreground">
                    {editingUser.active ? 'Пользователь активен' : 'Пользователь деактивирован'}
                  </div>
                </div>
                <Switch
                  checked={editingUser.active}
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, active: checked })}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-900 mb-2">
                  Права роли "{ROLE_PERMISSIONS[editingUser.role]?.label}"
                </div>
                <div className="flex flex-wrap gap-1">
                  {ROLE_PERMISSIONS[editingUser.role]?.permissions.map(permission => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {PERMISSION_LABELS[permission]}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveUser}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
