import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
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
import { DocumentManager } from '../documents/DocumentManager';
import { toast } from 'sonner';
import { EmptyClientsState, ErrorState, LoadingState } from '../ui/empty-state';

const statusLabels = {
  lead: 'Лид',
  new: 'Новый',
  client: 'Клиент',
  in_work: 'В работе',
  lost: 'Потерян'
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
    clearError,
    subscribeToRealtime,
    unsubscribeFromRealtime
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

  // Subscribe to real-time updates for collaboration
  useEffect(() => {
    subscribeToRealtime();
    
    return () => {
      unsubscribeFromRealtime();
    };
  }, [subscribeToRealtime, unsubscribeFromRealtime]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.contacts?.[0]?.phone?.includes(searchQuery) ||
                           client.contacts?.[0]?.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="size-4 mr-2" />
                    Фильтры
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Статус клиента</h4>
                      <div className="space-y-1">
                        <div 
                          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${statusFilter === 'all' ? 'bg-accent' : ''}`}
                          onClick={() => setStatusFilter('all')}
                        >
                          {statusFilter === 'all' && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>}
                          {statusFilter !== 'all' && <div className="w-4 h-4 rounded-full border-2"></div>}
                          <span className="text-sm">Все статусы</span>
                        </div>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <div 
                            key={key}
                            className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${statusFilter === key ? 'bg-accent' : ''}`}
                            onClick={() => setStatusFilter(key)}
                          >
                            {statusFilter === key && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>}
                            {statusFilter !== key && <div className="w-4 h-4 rounded-full border-2"></div>}
                            <span className="text-sm">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
                    <TableCell colSpan={7} className="p-0">
                      {searchQuery || statusFilter !== 'all' ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Клиенты не найдены</p>
                        </div>
                      ) : (
                        <EmptyClientsState onCreateClient={() => setIsNewClientOpen(true)} />
                      )}
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
        onOpenChange={(open) => {
          setIsClientDetailOpen(open);
          if (!open) {
            // Refresh when closing to get latest data
            fetchClients();
          }
        }}
        onNavigate={(page: string) => navigate(`/${page}`)}
        onClientUpdate={async (updatedClient) => {
          try {
            console.log('Updating client:', updatedClient.id);
            console.log('📥 Client data to save:', JSON.stringify({
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
            }, null, 2));
            
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
            console.log('✅ Client updated successfully');
            // Refresh list to show changes
            await fetchClients();
          } catch (error: any) {
            console.error('❌ Error updating client:', error);
            toast.error(`Ошибка при обновлении клиента: ${error.message}`);
            throw error; // Re-throw so EditClientDialog knows it failed
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
          <DocumentManager 
            entityType="client"
            entityId={client.id}
            documents={client.documents || []}
            onDocumentAdd={(document: any) => {
              // Обновляем документы клиента
              const updatedClient = {
                ...client,
                documents: [...(client.documents || []), document]
              };
              // TODO: Update client through API
              toast.success('Документ добавлен к клиенту');
            }}
            onDocumentDelete={(documentId: string) => {
              // Удаляем документ из клиента
              const updatedClient = {
                ...client,
                documents: (client.documents || []).filter(doc => doc.id !== documentId)
              };
              // TODO: Update client through API
              toast.success('Документ удален');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}