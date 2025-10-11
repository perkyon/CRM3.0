import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MessageSquare,
  FolderOpen,
  Calendar,
  FileText,
  History,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { useUserStore } from '../../lib/stores/userStore';
import { useProjects } from '../../contexts/ProjectContextNew';
import { useClientStore } from '../../lib/stores/clientStore';
import { formatCurrency, formatDate, getInitials, formatPhone } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { Client } from '../../types';
import { ClientDetailDialog } from '../clients/ClientDetailDialog';
import { NewClientDialog } from '../clients/NewClientDialog';
import { toast } from 'sonner';

const statusLabels = {
  new: 'Новый',
  client: 'Клиент',
  in_work: 'В работе',
  completed: 'Завершен'
};

const typeLabels: Record<string, string> = {
  'Физ. лицо': 'Физ. лицо',
  'ИП': 'ИП',
  'ООО': 'ООО'
};

export function Clients() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    clearError
  } = useClientStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Load clients on component mount
  React.useEffect(() => {
    // Предзагрузка с небольшой задержкой для лучшего UX
    const timer = setTimeout(() => {
      fetchClients();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchClients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.contacts[0]?.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchQuery, statusFilter]);

  const getClientProjects = (clientId: string) => {
    return projects.filter(p => p.clientId === clientId);
  };

  const { users, fetchUsers } = useUserStore();
  
  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const getOwnerName = (ownerId: string) => {
    const owner = users.find(u => u.id === ownerId);
    return owner?.name || 'Не назначен';
  };

  const handleClientCreate = async (clientData: Omit<Client, 'id' | 'createdAt' | 'lastActivity' | 'projectsCount' | 'arBalance' | 'tags' | 'documents' | 'updatedAt'>) => {
    try {
      await createClient({
        name: clientData.name,
        company: clientData.company,
        type: clientData.type,
        status: clientData.status,
        preferredChannel: clientData.preferredChannel || 'Phone', // Default to Phone if not specified
        ownerId: clientData.ownerId,
        contacts: clientData.contacts,
        addresses: clientData.addresses,
        source: 'manual', // Add required source field
      });
      
      toast.success('Клиент успешно создан');
      setIsNewClientOpen(false);
      
      // Refresh clients list
      await fetchClients();
    } catch (error: any) {
      toast.error(`Ошибка создания клиента: ${error.message}`);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      await deleteClient(clientToDelete.id);
      toast.success('Клиент успешно удален');
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      await fetchClients();
    } catch (error: any) {
      toast.error(`Ошибка при удалении клиента: ${error.message}`);
    }
  };

  // Handle error display
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-800 font-medium">Ошибка загрузки клиентов</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                clearError();
                fetchClients();
              }}
            >
              Повторить
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium">Клиенты</h1>
          <p className="text-muted-foreground">Управление клиентской базой</p>
        </div>
        <Button onClick={() => setIsNewClientOpen(true)}>
          <Plus className="size-4 mr-2" />
          Добавить клиента
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, телефону..."
                value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="size-4 mr-2" />
                    Фильтры
                  </Button>
                </SheetTrigger>
                <SheetContent aria-describedby="filters-sheet-description">
                  <SheetDescription id="filters-sheet-description" className="sr-only">
                    Панель расширенных фильтров для поиска клиентов
                  </SheetDescription>
                  <SheetHeader>
                    <SheetTitle>Расширенные фильтры</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-3 block">Статус клиента</label>
                      <div className="space-y-2">
                        <label 
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        >
                          <input 
                            type="radio" 
                            name="status"
                            value="all"
                            checked={statusFilter === 'all'}
                            onChange={() => setStatusFilter('all')}
                            className="w-4 h-4"
                          />
                          <span className="font-medium">✓ Все статусы</span>
                        </label>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <label 
                            key={key} 
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          >
                            <input 
                              type="radio" 
                              name="status"
                              value={key}
                              checked={statusFilter === key}
                              onChange={() => setStatusFilter(key)}
                              className="w-4 h-4"
                            />
                            <span className="font-medium">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Тип клиента</label>
                      <div className="space-y-2 mt-2">
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <label key={key} className="flex items-center space-x-2">
                            <input type="checkbox" />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ответственный</label>
                      <select className="w-full p-2 border rounded-md mt-2">
                        <option value="">Все</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Клиенты ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Проекты</TableHead>
                  <TableHead>Баланс</TableHead>
                  <TableHead>Ответственный</TableHead>
                  <TableHead>Активность</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <div className="text-center">
                          <p className="text-muted-foreground font-medium">Загрузка клиентов...</p>
                          <p className="text-sm text-muted-foreground mt-1">Это может занять несколько секунд</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchQuery || statusFilter !== 'all' ? 'Клиенты не найдены' : 'Нет клиентов'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      setSelectedClient(client);
                      setIsClientDetailOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {typeLabels[client.type]}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{formatPhone(client.contacts[0]?.phone)}</div>
                        <div className="text-sm text-muted-foreground">{client.contacts[0]?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={client.status}>
                        {statusLabels[client.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{client.projectsCount}</TableCell>
                    <TableCell>
                      {client.arBalance > 0 ? (
                        <span className="text-destructive">{formatCurrency(client.arBalance)}</span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{getOwnerName(client.ownerId)}</TableCell>
                    <TableCell>{formatDate(client.lastActivity)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setIsClientDetailOpen(true);
                          }}>
                            <Eye className="size-4 mr-2" />
                            Открыть
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              setClientToDelete(client);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="size-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Client Detail Dialog */}
      <ClientDetailDialog
        client={selectedClient}
        open={isClientDetailOpen}
        onOpenChange={setIsClientDetailOpen}
        onNavigate={(page: string) => navigate(`/${page}`)}
        onClientUpdate={async (updatedClient) => {
          try {
            await updateClient(updatedClient.id, {
              name: updatedClient.name,
              company: updatedClient.company,
              type: updatedClient.type,
              status: updatedClient.status,
              source: updatedClient.source,
              preferredChannel: updatedClient.preferredChannel,
              ownerId: updatedClient.ownerId,
              notes: updatedClient.notes,
              contacts: updatedClient.contacts,
              addresses: updatedClient.addresses,
            });
            toast.success('Клиент успешно обновлен');
            await fetchClients(); // Refresh list
          } catch (error) {
            console.error('Error updating client:', error);
            toast.error('Ошибка при обновлении клиента');
          }
        }}
      />

      {/* New Client Dialog */}
      <NewClientDialog
        open={isNewClientOpen}
        onOpenChange={setIsNewClientOpen}
        onClientCreate={handleClientCreate}
      />

      {/* Delete Client Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить клиента?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить клиента "{clientToDelete?.name}"? 
              Это действие нельзя отменить. Все данные клиента будут безвозвратно утеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClient}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Удалить клиента
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ClientProfile({ client, projects, onNavigate }: { 
  client: Client; 
  projects: any[];
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="space-y-6">
      <SheetHeader>
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle>{client.name}</SheetTitle>
            <StatusBadge status={client.status}>
              {statusLabels[client.status]}
            </StatusBadge>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onNavigate('projects')}>
              <FolderOpen className="size-4 mr-2" />
              Создать проект
            </Button>
            <Button variant="outline">
              <MessageSquare className="size-4 mr-2" />
              Написать
            </Button>
          </div>
        </div>
      </SheetHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="communications">Общение</TabsTrigger>
          <TabsTrigger value="finance">Финансы</TabsTrigger>
          <TabsTrigger value="files">Файлы</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Телефон</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="size-4" />
                    <span>{formatPhone(client.contacts[0]?.phone)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="size-4" />
                    <span>{client.contacts[0]?.email}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Адрес</label>
                <div className="mt-1">
                  {client.addresses.physical?.street}, {client.addresses.physical?.city}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Активные проекты</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground">{project.id}</div>
                      </div>
                      <StatusBadge status={project.stage}>
                        {project.stage}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Нет активных проектов</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Все проекты клиента</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.id} • {formatCurrency(project.budget)}
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={project.stage}>
                          {project.stage}
                        </StatusBadge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDate(project.dueDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="size-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Нет проектов</h3>
                  <p className="text-muted-foreground mb-4">
                    У этого клиента пока нет проектов
                  </p>
                  <Button onClick={() => onNavigate('projects')}>
                    Создать первый проект
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>История общения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Нет записей</h3>
                <p className="text-muted-foreground mb-4">
                  История общения с клиентом пуста
                </p>
                <Button variant="outline">
                  Добавить запись
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Финансовая информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Общая сумма проектов</div>
                    <div className="text-xl font-bold">
                      {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Задолженность</div>
                    <div className="text-xl font-bold text-destructive">
                      {formatCurrency(client.arBalance)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Файлы и документы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Нет файлов</h3>
                <p className="text-muted-foreground mb-4">
                  Файлы клиента будут отображаться здесь
                </p>
                <Button variant="outline">
                  Загрузить файл
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}