import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText,
  Package,
  Edit3,
  Phone,
  Mail,
  Plus,
  Warehouse
} from 'lucide-react';
import { mockClients, mockUsers, projectStageNames, stageOrder, productionSubStages, productionSubStageOrder } from '../../lib/mockData';
import { useProjects } from '../../contexts/ProjectContextNew';
import { DocumentManager } from '../documents/DocumentManager';
import { MaterialsManager } from '../materials/MaterialsManager';
import { SimpleEditDialog } from '../projects/SimpleEditDialog';
import { ClientDetailDialog } from '../clients/ClientDetailDialog';
import { formatCurrency, formatDate, getDaysUntilDue } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { Project } from '../../types';
import { toast } from '../../lib/toast';

export function ProjectOverview() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const [project, setProject] = useState(getProject(projectId!));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      setProject(getProject(projectId));
    }
  }, [projectId, getProject]);
  
  if (!project) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="size-4 mr-2" />
            Назад к проектам
          </Button>
        </div>
        <div className="text-center py-16">
          <h2 className="text-xl font-medium mb-2">Проект не найден</h2>
          <p className="text-muted-foreground">Проект с ID {projectId} не существует</p>
        </div>
      </div>
    );
  }

  const client = mockClients.find(c => c.id === project.clientId);
  const manager = mockUsers.find(u => u.id === project.managerId);
  const foreman = mockUsers.find(u => u.id === project.foremanId);
  
  const daysLeft = project.dueDate ? getDaysUntilDue(project.dueDate) : 0;
  const progress = getProjectProgress(project.stage);

  function getProjectProgress(stage: string): number {
    const stageIndex = stageOrder.indexOf(stage as any);
    if (stageIndex === -1) return 0;
    return ((stageIndex + 1) / stageOrder.length) * 100;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Срочный';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
    // В реальном приложении здесь был бы API вызов для обновления проекта
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="size-4 mr-2" />
            Назад к проектам
          </Button>
          <div className="border-l border-border h-6"></div>
          <div>
            <h1 className="text-2xl font-medium">{project.title}</h1>
            <p className="text-muted-foreground">ID: {project.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="mr-2"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit3 className="size-4 mr-2" />
            Редактировать
          </Button>
          <Button onClick={() => navigate(`/production/${project.id}`)}>
            <Settings className="size-4 mr-2" />
            Перейти к производству
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Текущий этап</p>
                <div className="mt-2">
                  <StatusBadge status={project.stage}>
                    {projectStageNames[project.stage] || project.stage}
                  </StatusBadge>
                </div>
              </div>
              <CheckCircle className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Прогресс</p>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
              <Package className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Приоритет</p>
                <div className="mt-2">
                  <Badge variant={getPriorityColor(project.priority) as any}>
                    {getPriorityText(project.priority)}
                  </Badge>
                </div>
              </div>
              <AlertTriangle className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">До сдачи</p>
                <div className="mt-2">
                  <p className={`font-medium ${
                    daysLeft < 0 ? 'text-destructive' : 
                    daysLeft < 3 ? 'text-orange-600' : 
                    'text-foreground'
                  }`}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)} дн. просрочка` : `${daysLeft} дн.`}
                  </p>
                </div>
              </div>
              <Clock className="size-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о проекте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="size-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Клиент</p>
                      <p className="font-medium">{client?.name || 'Не указан'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Адрес объекта</p>
                      <p className="font-medium">{project.siteAddress || 'Не указан'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Бюджет</p>
                      <p className="font-medium">{formatCurrency(project.budget)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Менеджер</p>
                      <p className="font-medium">{manager?.name || 'Не назначен'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Начальник цеха</p>
                      <p className="font-medium">{foreman?.name || 'Не назначен'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Срок сдачи</p>
                      <p className="font-medium">
                        {project.dueDate ? formatDate(project.dueDate) : 'Не указан'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Tabs */}
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Этапы</TabsTrigger>
              <TabsTrigger value="documents">Документы</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Этапы проекта</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Прогресс выполнения: {Math.round(progress)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`
                        inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                        ${project.stage === 'brief' ? 'bg-orange-100 text-orange-700' :
                          project.stage === 'done' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }
                      `}>
                        <div className={`size-2 rounded-full
                          ${project.stage === 'brief' ? 'bg-orange-500' :
                            project.stage === 'done' ? 'bg-green-500' :
                            'bg-blue-500'
                          }
                        `} />
                        {projectStageNames[project.stage]}
                        {project.stage === 'production' && project.productionSubStage && (
                          <span className="text-xs text-muted-foreground">
                            · {productionSubStages[project.productionSubStage]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Compact Timeline */}
                    <div className="space-y-1">
                      {stageOrder.map((stage, index) => {
                        const isCompleted = stageOrder.indexOf(project.stage) > index;
                        const isCurrent = project.stage === stage;
                        const isLast = index === stageOrder.length - 1;
                        
                        return (
                          <div key={stage}>
                            {/* Main Stage */}
                            <div className="relative flex items-center gap-3 py-2">
                              {/* Timeline Line */}
                              {!isLast && (
                                <div className={`
                                  absolute left-3 top-8 w-px h-4 
                                  ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}
                                `} />
                              )}
                              
                              {/* Circle Indicator */}
                              <div className={`
                                relative z-10 size-6 rounded-full flex items-center justify-center
                                ${isCompleted ? 'bg-green-500 text-white' :
                                  isCurrent ? 'bg-blue-500 text-white' :
                                  'bg-gray-100 border-2 border-gray-300 text-gray-500'
                                }
                              `}>
                                {isCompleted ? (
                                  <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <span className="text-xs font-medium">{index + 1}</span>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 flex items-center justify-between">
                                <div>
                                  <h4 className={`text-sm font-medium
                                    ${isCompleted ? 'text-green-700' :
                                      isCurrent ? 'text-blue-700' :
                                      'text-gray-600'
                                    }
                                  `}>
                                    {projectStageNames[stage]}
                                  </h4>
                                </div>
                                
                                {isCurrent && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="text-xs">В работе</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Production Sub-stages */}
                            {stage === 'production' && (isCurrent || isCompleted) && (
                              <div className="ml-9 space-y-1 pb-2">
                                {productionSubStageOrder.map((subStage, subIndex) => {
                                  const isSubCompleted = isCurrent && project.productionSubStage && 
                                    productionSubStageOrder.indexOf(project.productionSubStage) > subIndex;
                                  const isSubCurrent = isCurrent && project.productionSubStage === subStage;
                                  const allSubCompleted = isCompleted; // Если основной этап завершен, то все подэтапы завершены
                                  
                                  return (
                                    <div key={subStage} className="flex items-center gap-2 py-1">
                                      <div className={`
                                        size-3 rounded-full
                                        ${allSubCompleted || isSubCompleted ? 'bg-green-400' :
                                          isSubCurrent ? 'bg-blue-400' :
                                          'bg-gray-200'
                                        }
                                      `} />
                                      <span className={`text-xs
                                        ${allSubCompleted || isSubCompleted ? 'text-green-600' :
                                          isSubCurrent ? 'text-blue-600' :
                                          'text-muted-foreground'
                                        }
                                      `}>
                                        {productionSubStages[subStage]}
                                        {isSubCurrent && (
                                          <span className="ml-2 text-blue-500">• текущий</span>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <DocumentManager 
                entityType="project"
                entityId={project.id}
                documents={project.documents || []}
                onDocumentAdd={(document) => {
                  // В реальном приложении здесь будет обновление проекта через API
                  console.log('Document added to project:', document);
                }}
                onDocumentDelete={(documentId) => {
                  // В реальном приложении здесь будет удаление документа через API
                  console.log('Document deleted from project:', documentId);
                }}
              />
            </TabsContent>
            

          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  size="sm" 
                  className="h-12"
                  onClick={() => navigate(`/production/${project.id}`)}
                >
                  <Settings className="size-4" />
                  <span className="sr-only">Производство</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="h-12 mr-2"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit3 className="size-4" />
                  <span className="sr-only">Редактировать</span>
                </Button>
                {client && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        const primaryContact = client.contacts.find(c => c.isPrimary) || client.contacts[0];
                        if (primaryContact?.phone) {
                          window.open(`tel:${primaryContact.phone}`, '_self');
                        }
                      }}
                    >
                      <Phone className="size-4" />
                      <span className="sr-only">Позвонить</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        const primaryContact = client.contacts.find(c => c.isPrimary) || client.contacts[0];
                        if (primaryContact?.email) {
                          window.open(`mailto:${primaryContact.email}`, '_blank');
                        }
                      }}
                    >
                      <Mail className="size-4" />
                      <span className="sr-only">Email</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          {client && (
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setIsClientDialogOpen(true)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Контакт
                  <Building2 className="size-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <p className="font-medium text-sm">{client.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {client.contacts.find(c => c.isPrimary)?.phone || client.contacts[0]?.phone || 'Не указан'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {client.contacts.find(c => c.isPrimary)?.email || client.contacts[0]?.email || 'Не указан'}
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Project Dialog */}
      {project && (
        <SimpleEditDialog
          project={project}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onProjectUpdate={handleProjectUpdate}
        />
      )}

      {/* Client Detail Dialog */}
      <ClientDetailDialog
        client={client || null}
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onNavigate={(page: string) => navigate(`/${page}`)}
        onClientUpdate={(updatedClient) => {
          // В реальном приложении здесь будет обновление клиента через API
          console.log('Client updated:', updatedClient);
        }}
      />
    </div>
  );
}