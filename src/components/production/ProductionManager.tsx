import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Package,
  Settings,
  CheckCircle,
  Clock,
  Play
} from 'lucide-react';
import { 
  ComponentType, 
  SubComponentType,
  ProjectComponent, 
  ProjectSubComponent,
  ProductionNavigationState
} from '../../types';
import { ComponentSelector } from './ComponentSelector';
import { SubComponentSelector } from './SubComponentSelector';
import { ProductionKanban } from './ProductionKanban';
import { toast } from '../../lib/toast';

// Названия компонентов
const componentNames: Record<ComponentType, string> = {
  kitchen: 'Кухня',
  living_room: 'Гостинная',
  bedroom: 'Спальня',
  wardrobe: 'Гардеробная',
  bathroom: 'Ванная',
  children_room: 'Детская',
  office: 'Офис',
  hallway: 'Прихожая',
  balcony: 'Балкон',
  other: 'Прочее'
};

// Названия подкомпонентов
const subComponentNames: Record<SubComponentType, string> = {
  sink: 'Раковина',
  kitchen_set: 'Гарнитур',
  cabinet: 'Шкаф',
  table: 'Стол',
  chair: 'Стул',
  bed: 'Кровать',
  wardrobe: 'Шкаф-купе',
  sofa: 'Диван',
  tv_stand: 'ТВ-тумба',
  shelf: 'Полка',
  mirror: 'Зеркало',
  bathroom_set: 'Ванная комплект',
  other: 'Прочее'
};

export function ProductionManager() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [navigationState, setNavigationState] = useState<ProductionNavigationState>({
    currentStep: 'components',
    projectId: projectId || ''
  });
  
  const [projectComponents, setProjectComponents] = useState<ProjectComponent[]>([]);
  const [projectSubComponents, setProjectSubComponents] = useState<ProjectSubComponent[]>([]);
  const [loading, setLoading] = useState(false);

  // Загружаем данные проекта
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // TODO: Загрузить компоненты и подкомпоненты проекта из API
      // const components = await productionService.getProjectComponents(projectId);
      // const subComponents = await productionService.getProjectSubComponents(projectId);
      // setProjectComponents(components);
      // setProjectSubComponents(subComponents);
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  };

  const handleComponentSelect = (componentType: ComponentType) => {
    // TODO: Создать компонент через API
    console.log('Selected component:', componentType);
  };

  const handleComponentsNext = () => {
    setNavigationState(prev => ({
      ...prev,
      currentStep: 'subcomponents'
    }));
  };

  const handleSubComponentSelect = (subComponentType: SubComponentType) => {
    // TODO: Создать подкомпонент через API
    console.log('Selected sub-component:', subComponentType);
  };

  const handleSubComponentsNext = () => {
    setNavigationState(prev => ({
      ...prev,
      currentStep: 'production'
    }));
  };

  const handleStageUpdate = (stageId: string, updates: any) => {
    // TODO: Обновить этап через API
    console.log('Stage updated:', stageId, updates);
  };

  const getCurrentStepTitle = () => {
    switch (navigationState.currentStep) {
      case 'components':
        return 'Выбор компонентов';
      case 'subcomponents':
        return 'Выбор элементов';
      case 'production':
        return 'Управление производством';
      default:
        return 'Производство';
    }
  };

  const getCurrentStepDescription = () => {
    switch (navigationState.currentStep) {
      case 'components':
        return 'Выберите типы помещений для проекта';
      case 'subcomponents':
        return 'Выберите конкретные элементы для производства';
      case 'production':
        return 'Управляйте этапами производства';
      default:
        return '';
    }
  };

  const renderCurrentStep = () => {
    switch (navigationState.currentStep) {
      case 'components':
        return (
          <ComponentSelector
            projectId={navigationState.projectId}
            onComponentSelect={handleComponentSelect}
            onNext={handleComponentsNext}
          />
        );
      
      case 'subcomponents':
        if (!navigationState.selectedComponentId) {
          // Показываем список компонентов для выбора
          return (
            <div className="p-6 lg:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setNavigationState(prev => ({ ...prev, currentStep: 'components' }))}>
                  <ArrowLeft className="size-4 mr-2" />
                  Назад
                </Button>
                <div>
                  <h1 className="text-2xl font-medium">Выберите компонент</h1>
                  <p className="text-muted-foreground">Выберите компонент для добавления элементов</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectComponents.map(component => (
                  <Card 
                    key={component.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setNavigationState(prev => ({ 
                      ...prev, 
                      selectedComponentId: component.id 
                    }))}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Package className="size-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{component.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {component.subComponents?.length || 0} элементов
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        }
        
        const selectedComponent = projectComponents.find(c => c.id === navigationState.selectedComponentId);
        return (
          <SubComponentSelector
            componentId={navigationState.selectedComponentId}
            componentName={selectedComponent?.name || 'Компонент'}
            onSubComponentSelect={handleSubComponentSelect}
            onNext={handleSubComponentsNext}
          />
        );
      
      case 'production':
        if (!navigationState.selectedSubComponentId) {
          // Показываем список подкомпонентов для выбора
          return (
            <div className="p-6 lg:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setNavigationState(prev => ({ 
                  ...prev, 
                  currentStep: 'subcomponents',
                  selectedComponentId: undefined
                }))}>
                  <ArrowLeft className="size-4 mr-2" />
                  Назад
                </Button>
                <div>
                  <h1 className="text-2xl font-medium">Выберите элемент</h1>
                  <p className="text-muted-foreground">Выберите элемент для управления производством</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectSubComponents.map(subComponent => (
                  <Card 
                    key={subComponent.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setNavigationState(prev => ({ 
                      ...prev, 
                      selectedSubComponentId: subComponent.id 
                    }))}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <Settings className="size-8 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{subComponent.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subComponent.productionStages?.length || 0} этапов
                          </p>
                          <div className="flex gap-1 mt-2">
                            {subComponent.productionStages?.map(stage => (
                              <Badge 
                                key={stage.id} 
                                variant={stage.status === 'completed' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {stage.status === 'completed' ? (
                                  <CheckCircle className="size-3 mr-1" />
                                ) : stage.status === 'in_progress' ? (
                                  <Play className="size-3 mr-1" />
                                ) : (
                                  <Clock className="size-3 mr-1" />
                                )}
                                {stage.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        }
        
        const selectedSubComponent = projectSubComponents.find(sc => sc.id === navigationState.selectedSubComponentId);
        return (
          <ProductionKanban
            subComponentId={navigationState.selectedSubComponentId}
            subComponentName={selectedSubComponent?.name || 'Элемент'}
            onStageUpdate={handleStageUpdate}
          />
        );
      
      default:
        return null;
    }
  };

  if (!projectId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-medium mb-2">Проект не найден</h2>
          <p className="text-muted-foreground">ID проекта не указан</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              <ArrowLeft className="size-4 mr-2" />
              К проектам
            </Button>
            <div className="border-l border-border h-6"></div>
            <div>
              <h1 className="text-xl font-medium">{getCurrentStepTitle()}</h1>
              <p className="text-sm text-muted-foreground">{getCurrentStepDescription()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {renderCurrentStep()}
      </div>
    </div>
  );
}
