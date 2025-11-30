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
import { projectStageNames, stageOrder } from '../../lib/constants';
import { useUsers } from '../../lib/hooks/useUsers';
import { useProjects } from '../../contexts/ProjectContextNew';
import { useClientStore } from '../../lib/stores/clientStore';
import { DocumentManager } from '../documents/DocumentManager';
import { MaterialsManager } from '../materials/MaterialsManager';
import { SimpleEditDialog } from '../projects/SimpleEditDialog';
import { ClientDetailDialog } from '../clients/ClientDetailDialog';
import { StageSelector } from '../projects/StageSelector';
import { formatCurrency, formatDate, getDaysUntilDue } from '../../lib/utils';
import { StatusBadge } from '../ui/status-badge';
import { Project, ProjectStage } from '../../types';
import { toast } from '../../lib/toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function ProjectOverview() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, selectedProject, fetchProject, updateProject } = useProjects();
  const { clients } = useClientStore();
  const { users } = useUsers();
  const [project, setProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      setNotFound(false);
      
      // Сначала ищем в локальных проектах (по code или id)
      const localProject = projects.find(p => 
        p.id === projectId || p.code === projectId
      );
      if (localProject) {
        setProject(localProject);
        setIsLoading(false);
        // Загружаем документы проекта
        loadProjectDocuments(localProject.id);
      } else {
        // Если не найден локально, загружаем из API (поддерживает и code и id)
        fetchProject(projectId)
          .then(() => {
            if (selectedProject && (selectedProject.id === projectId || selectedProject.code === projectId)) {
              setProject(selectedProject);
              setIsLoading(false);
              loadProjectDocuments(selectedProject.id);
            } else {
              // Проект не найден
              setIsLoading(false);
              setNotFound(true);
            }
          })
          .catch((error) => {
            console.error('Error fetching project:', error);
            setIsLoading(false);
            setNotFound(true);
          });
      }
    } else {
      setIsLoading(false);
      setNotFound(true);
    }
  }, [projectId, projects, selectedProject, fetchProject]);

  const loadProjectDocuments = async (projectId: string) => {
    try {
      const { supabaseProjectService } = await import('../../lib/supabase/services/ProjectService');
      const documents = await supabaseProjectService.getProjectDocuments(projectId);
      setProject(prev => prev ? { ...prev, documents } : null);
    } catch (error) {
      console.error('Error loading project documents:', error);
    }
  };

  // Обновляем проект при изменении selectedProject
  useEffect(() => {
    if (selectedProject && (selectedProject.id === projectId || selectedProject.code === projectId)) {
      setProject(selectedProject);
      setIsLoading(false);
      setNotFound(false);
    }
  }, [selectedProject, projectId]);
  
  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/projects')}>
            <ArrowLeft className="size-4 mr-2" />
            Назад к проектам
          </Button>
        </div>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-medium mb-2">Загрузка проекта...</h2>
        </div>
      </div>
    );
  }
  
  // Проект не найден
  if (!project || notFound) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/projects')}>
            <ArrowLeft className="size-4 mr-2" />
            Назад к проектам
          </Button>
        </div>
        <div className="text-center py-16">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Проект не найден</h2>
          <p className="text-muted-foreground mb-4">
            Проект с ID {projectId} не существует или у вас нет доступа к нему
          </p>
          <Button onClick={() => navigate('/app/projects')}>
            Вернуться к списку проектов
          </Button>
        </div>
      </div>
    );
  }

  const client = clients.find((c: any) => c.id === project.clientId);
  const manager = users.find(u => u.id === project.managerId);
  const foreman = users.find(u => u.id === project.foremanId);
  
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

  const handleStageChange = async (newStage: ProjectStage) => {
    if (!project) return;
    
    try {
      const updatedProject = await updateProject(project.id, { 
        stage: newStage,
        cancelReason: newStage === 'cancelled' ? project.cancelReason : null
      });
      setProject(updatedProject);
      toast.success('Этап проекта обновлен');
    } catch (error) {
      toast.error('Ошибка обновления этапа');
    }
  };

  const handleCancelProject = async (reason: string) => {
    if (!project) return;

    try {
      const updatedProject = await updateProject(project.id, { stage: 'cancelled', cancelReason: reason });
      setProject(updatedProject);
      toast.success('Проект помечен как отмененный');
    } catch (error) {
      toast.error('Не удалось отменить проект');
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

  const isProjectCancelled = project.stage === 'cancelled';

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/projects')}>
            <ArrowLeft className="size-4 mr-2" />
            Назад к проектам
          </Button>
          <div className="border-l border-border h-6"></div>
          <div>
            <h1 className="text-2xl font-medium">{project.title}</h1>
            <p className="text-muted-foreground">ID: {project.code || project.id}</p>
            {isProjectCancelled && (
              <Badge variant="destructive" className="mt-2">
                Проект отменен
              </Badge>
            )}
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

      {isProjectCancelled && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Проект отменен</AlertTitle>
          <AlertDescription>
            {project.cancelReason || 'Причина отмены не указана'}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Текущий этап</p>
                <div className="mt-2">
                  <StageSelector 
                    currentStage={project.stage}
                    onStageChange={handleStageChange}
                    onCancelProject={handleCancelProject}
                  />
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
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Описание проекта</p>
                {project.description ? (
                  <p className="text-sm whitespace-pre-wrap">{project.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Описание не заполнено</p>
                )}
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
                          (project.stage === 'completed' || project.stage === 'done') ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }
                      `}>
                        <div className={`size-2 rounded-full
                          ${project.stage === 'brief' ? 'bg-orange-500' :
                            (project.stage === 'completed' || project.stage === 'done') ? 'bg-green-500' :
                            'bg-blue-500'
                          }
                        `} />
                        {projectStageNames[project.stage as keyof typeof projectStageNames] || project.stage}
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
                                    {projectStageNames[stage as keyof typeof projectStageNames] || stage}
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
                onDocumentAdd={async (document) => {
                  try {
                    const updatedProject = {
                      ...project,
                      documents: [...(project.documents || []), document]
                    };
                    // TODO: Update project through API
                    setProject(updatedProject);
                    toast.success('Документ добавлен к проекту');
                  } catch (error) {
                    console.error('Error adding document:', error);
                    toast.error('Ошибка при добавлении документа');
                  }
                }}
                onDocumentDelete={async (documentId) => {
                  try {
                    const updatedProject = {
                      ...project,
                      documents: (project.documents || []).filter(d => d.id !== documentId)
                    };
                    // TODO: Update project through API  
                    setProject(updatedProject);
                    toast.success('Документ удален');
                  } catch (error) {
                    console.error('Error deleting document:', error);
                    toast.error('Ошибка при удалении документа');
                  }
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
                        const primaryContact = client.contacts.find((c: any) => c.isPrimary) || client.contacts[0];
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
                        const primaryContact = client.contacts.find((c: any) => c.isPrimary) || client.contacts[0];
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
                      {client.contacts.find((c: any) => c.isPrimary)?.phone || client.contacts[0]?.phone || 'Не указан'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {client.contacts.find((c: any) => c.isPrimary)?.email || client.contacts[0]?.email || 'Не указан'}
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