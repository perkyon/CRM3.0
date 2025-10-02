import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';

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
  History
} from 'lucide-react';
import { mockClients, mockUsers } from '../../lib/mockData';
import { useProjects } from '../../contexts/ProjectContextNew';
import { formatCurrency, formatDate, getInitials, formatPhone } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { Client } from '../../types';
import { ClientDetailDialog } from '../clients/ClientDetailDialog';
import { NewClientDialog } from '../clients/NewClientDialog';

const statusLabels = {
  lead: 'Лид',
  new: 'Новый',
  in_work: 'В работе',
  lost: 'Потерян',
  client: 'Клиент'
};

const typeLabels = {
  'ФЛ': 'Физ. лицо',
  'ИП': 'ИП',
  'ООО': 'ООО'
};

export function Clients() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [clients, setClients] = useState(mockClients);

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

  const getOwnerName = (ownerId: string) => {
    const owner = mockUsers.find(u => u.id === ownerId);
    return owner?.name || 'Не назначен';
  };

  const handleClientCreate = (clientData: Omit<Client, 'id' | 'createdAt' | 'lastActivity' | 'projectsCount' | 'arBalance' | 'tags' | 'documents'>) => {
    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      projectsCount: 0,
      arBalance: 0,
      tags: [],
      documents: []
    };
    
    setClients(prev => [newClient, ...prev]);
  };

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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Все статусы</option>
                <option value="lead">Лиды</option>
                <option value="new">Новые</option>
                <option value="in_work">В работе</option>
                <option value="client">Клиенты</option>
                <option value="lost">Потерянные</option>
              </select>
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
                  <div className="space-y-4 mt-6">
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
                      <label className="text-sm font-medium">Источник</label>
                      <Input placeholder="Поиск по источнику" className="mt-2" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ответственный</label>
                      <select className="w-full p-2 border rounded-md mt-2">
                        <option value="">Все</option>
                        {mockUsers.map(user => (
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
                {filteredClients.map((client) => (
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                          setIsClientDetailOpen(true);
                        }}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
        onClientUpdate={(updatedClient) => {
          setClients(prev => prev.map(client => 
            client.id === updatedClient.id ? updatedClient : client
          ));
        }}
      />

      {/* New Client Dialog */}
      <NewClientDialog
        open={isNewClientOpen}
        onOpenChange={setIsNewClientOpen}
        onClientCreate={handleClientCreate}
      />
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
        <TabsList>
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
                <div className="space-y-2">
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
                <div className="space-y-3">
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