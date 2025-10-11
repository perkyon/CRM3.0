import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Calendar,
  Edit3,
  Briefcase,
  Star,
  Activity,
  MessageCircle,
  FileText,
  Tag,
  ExternalLink,
  Download,
  Upload,
  Plus,
  Trash2,
  MessageSquare,
  Send
} from 'lucide-react';
import { Client, Project, ClientTag } from '../../types';
import { formatDate, formatCurrency, formatPhone, getInitials } from '../../lib/utils';
import { useProjects } from '../../contexts/ProjectContextNew';
import { StatusBadge } from '../ui/status-badge';
import { toast } from '../../lib/toast';
import { EditClientDialog } from './EditClientDialog';
import { DocumentManager } from '../documents/DocumentManager';

interface ClientDetailDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: string, params?: { projectId?: string; clientId?: string; taskId?: string } | null) => void;
  onClientUpdate?: (client: Client) => void;
}

const statusLabels = {
  lead: 'Лид',
  new: 'Новый',
  client: 'Клиент',
  in_work: 'В работе',
  lost: 'Потерян'
};

const typeLabels = {
  'Физ. лицо': 'Физическое лицо',
  'ИП': 'Индивидуальный предприниматель',
  'ООО': 'Общество с ограниченной ответственностью'
};

const documentCategoryLabels = {
  contract: 'Договоры',
  passport: 'Паспортные данные',
  inn: 'ИНН, ОГРН',
  invoice: 'Счета',
  receipt: 'Чеки, квитанции',
  photo: 'Фотографии',
  other: 'Прочее'
};

export function ClientDetailDialog({ client, open, onOpenChange, onNavigate, onClientUpdate }: ClientDetailDialogProps) {
  const { projects } = useProjects();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (!client) return null;

  const clientProjects = projects.filter(p => p.clientId === client.id);
  const primaryContact = client.contacts.find(c => c.isPrimary) || client.contacts[0];

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const getMessengerLink = (messenger: string, value: string) => {
    switch (messenger) {
      case 'whatsapp':
        return `https://wa.me/${(value || '').replace(/\\D/g, '')}`;
      case 'telegram':
        return `https://t.me/${(value || '').replace('@', '')}`;
      default:
        return '#';
    }
  };

  const getMessengerIcon = (messenger: string) => {
    switch (messenger) {
      case 'whatsapp':
        return MessageSquare;
      case 'telegram':
        return Send;
      default:
        return MessageCircle;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[96vw] sm:max-w-[96vw] w-full h-[96vh] flex flex-col p-0 gap-0 [&_[data-slot='dialog-close']]:z-50 [&_[data-slot='dialog-close']]:bg-background [&_[data-slot='dialog-close']]:border [&_[data-slot='dialog-close']]:border-border [&_[data-slot='dialog-close']]:shadow-sm [&_[data-slot='dialog-close']]:opacity-100 [&_[data-slot='dialog-close']]:right-6"
        aria-describedby="client-dialog-description"
      >
        <DialogDescription id="client-dialog-description" className="sr-only">
          Подробная информация о клиенте и управление проектами
        </DialogDescription>
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-border shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="flex items-center gap-3 mb-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl font-medium truncate">{client.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {typeLabels[client.type] || client.type}
                  </div>
                </div>
              </DialogTitle>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={client.status}>
                  {statusLabels[client.status]}
                </StatusBadge>
                
                {client.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    <Tag className="size-3 mr-1" />
                    {tag.name}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                Создан: {formatDate(client.createdAt)}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="mr-2" onClick={handleEdit}>
                <Edit3 className="size-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col">
            <div className="px-6 pt-6 pb-0 shrink-0 border-b">
              <TabsList className="w-full h-auto p-0 bg-transparent border-0 rounded-none flex justify-start gap-0">
                <TabsTrigger 
                  value="overview" 
                  className="text-sm py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                >
                  Обзор
                </TabsTrigger>
                <TabsTrigger 
                  value="projects" 
                  className="text-sm py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                >
                  Проекты
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="text-sm py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
                >
                  Документы
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <TabsContent value="overview" className="mt-0 m-0 h-full">
                <div className="px-6 py-6 space-y-6 overflow-y-auto h-full">
                  {/* Основная информация */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base">Основная информация</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="size-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-muted-foreground">Имя</div>
                            <div className="font-medium truncate">{client.name}</div>
                          </div>
                        </div>
                        
                        {client.company && (
                          <div className="flex items-center gap-3">
                            <Building2 className="size-5 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-muted-foreground">Компания</div>
                              <div className="font-medium truncate">{client.company}</div>
                            </div>
                          </div>
                        )}

                        {client.addresses?.physical?.street && (
                          <div className="flex items-start gap-3">
                            <MapPin className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-muted-foreground">Адрес</div>
                              <div className="font-medium">{client.addresses?.physical?.street || 'Не указан'}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Briefcase className="size-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-muted-foreground">Тип клиента</div>
                            <div className="font-medium">{typeLabels[client.type] || client.type}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Activity className="size-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-muted-foreground">Статус</div>
                            <StatusBadge status={client.status}>
                              {statusLabels[client.status]}
                            </StatusBadge>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Calendar className="size-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-muted-foreground">Создан</div>
                            <div className="font-medium">{formatDate(client.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Контакты */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center justify-between">
                        Контакты
                        <Badge variant="outline">
                          {client.contacts.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {client.contacts.map((contact) => (
                          <div key={contact.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{contact.name}</span>
                              {contact.isPrimary && (
                                <Badge variant="outline" className="text-xs">Основной</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">{contact.role}</div>
                            
                            <div className="space-y-2">
                              {/* Телефон */}
                              <div className="flex items-center gap-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <span className="font-medium">{formatPhone(contact.phone)}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                                >
                                  <Phone className="size-4" />
                                </Button>
                              </div>
                              
                              {/* Email */}
                              <div className="flex items-center gap-3">
                                <Mail className="size-4 text-muted-foreground" />
                                <span className="font-medium">{contact.email}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                                >
                                  <Mail className="size-4" />
                                </Button>
                              </div>
                              
                              {/* Мессенджеры */}
                              {contact.messengers?.whatsapp && (
                                <div className="flex items-center gap-3">
                                  <MessageCircle className="size-4 text-muted-foreground" />
                                  <span className="font-medium">WhatsApp: {contact.messengers?.whatsapp}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`https://wa.me/${(contact.messengers?.whatsapp || '').replace(/[^\d]/g, '')}`, '_blank')}
                                  >
                                    <MessageCircle className="size-4" />
                                  </Button>
                                </div>
                              )}
                              
                              {contact.messengers?.telegram && (
                                <div className="flex items-center gap-3">
                                  <MessageCircle className="size-4 text-muted-foreground" />
                                  <span className="font-medium">Telegram: {contact.messengers?.telegram}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`https://t.me/${contact.messengers?.telegram}`, '_blank')}
                                  >
                                    <MessageCircle className="size-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Проекты клиента */}
                  {clientProjects.length > 0 && (
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center justify-between">
                          Проекты
                          <Badge variant="outline">
                            {clientProjects.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {clientProjects.slice(0, 3).map((project) => (
                            <div 
                              key={project.id} 
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                              onClick={() => onNavigate('project-overview', { projectId: project.id })}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{project.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(project.budget)} • {formatDate(project.createdAt)}
                                </div>
                              </div>
                              <StatusBadge status={project.stage}>
                                {project.stage}
                              </StatusBadge>
                            </div>
                          ))}
                          {clientProjects.length > 3 && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => onNavigate('projects')}
                            >
                              Показать все проекты ({clientProjects.length})
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="projects" className="mt-0 m-0 h-full">
                <div className="px-6 py-6 overflow-y-auto h-full">
                  <div className="text-center py-16">
                    <Star className="size-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Проекты клиента</h3>
                    <p className="text-muted-foreground mb-4">
                      Все проекты для этого клиента будут отображаться здесь
                    </p>
                    <Button onClick={() => onNavigate('projects')}>
                      <Plus className="size-4 mr-2" />
                      Создать проект
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0 m-0 h-full">
                <div className="px-6 py-6 overflow-y-auto h-full">
                  <DocumentManager 
                    entityType="client"
                    entityId={client.id}
                    documents={client.documents || []}
                    onDocumentAdd={(document) => {
                      const updatedClient = {
                        ...client,
                        documents: [...(client.documents || []), document]
                      };
                      onClientUpdate?.(updatedClient);
                    }}
                    onDocumentDelete={(documentId) => {
                      const updatedClient = {
                        ...client,
                        documents: (client.documents || []).filter(d => d.id !== documentId)
                      };
                      onClientUpdate?.(updatedClient);
                    }}
                  />
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </DialogContent>

      {/* Edit Client Dialog */}
      <EditClientDialog
        client={client}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onClientUpdate={(updatedClient) => {
          if (onClientUpdate) {
            onClientUpdate(updatedClient);
          }
        }}
      />
    </Dialog>
  );
}