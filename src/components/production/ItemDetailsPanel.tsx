import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Plus, ChevronDown, ChevronRight, Image as ImageIcon, Loader2, MoreVertical, Edit, Trash2, Upload, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  ProductionItem,
  ProductionComponent,
  productionManagementService 
} from '../../lib/supabase/services/ProductionManagementService';
import { toast } from '../../lib/toast';
import { PRODUCTION_STAGES } from '../../lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { AddMaterialDialog, MaterialFormData } from './AddMaterialDialog';
import { MaterialDetailsDialog } from './MaterialDetailsDialog';
import { ProductionStageDialog, ProductionStageFormData } from './ProductionStageDialog';

// Русские названия единиц измерения
const UNIT_NAMES: Record<string, string> = {
  sheet: 'лист',
  sqm: 'м²',
  lm: 'п.м',
  piece: 'шт',
  kg: 'кг',
  liter: 'л',
  set: 'комплект',
};

interface ItemDetailsPanelProps {
  item: ProductionItem;
  onEdit: (item: ProductionItem) => void;
  onDelete: (item: ProductionItem) => void;
  onComponentAdd?: () => void;
  onComponentEdit?: (component: ProductionComponent) => void;
  onComponentDelete?: (component: ProductionComponent) => void;
}

export function ItemDetailsPanel({ item, onEdit, onDelete, onComponentAdd, onComponentEdit, onComponentDelete }: ItemDetailsPanelProps) {
  const [components, setComponents] = useState<ProductionComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openComponents, setOpenComponents] = useState<string[]>([]);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [currentComponentId, setCurrentComponentId] = useState<string | null>(null);
  const [componentMaterials, setComponentMaterials] = useState<Record<string, any[]>>({});
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [isMaterialDetailsOpen, setIsMaterialDetailsOpen] = useState(false);
  const [materialDialogMode, setMaterialDialogMode] = useState<'view' | 'edit'>('view');
  
  // Stage dialog state
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<any | null>(null);
  const [editingStageComponentId, setEditingStageComponentId] = useState<string | null>(null);

  // Load components when item changes or when item.components is updated
  useEffect(() => {
    // Если компоненты уже есть в item - используем их, иначе загружаем
    if (item.components && item.components.length > 0) {
      setComponents(item.components);
      // Загружаем материалы для компонентов
      loadMaterialsForComponents(item.components);
    } else {
      loadComponents();
    }
  }, [item.id, item.components]);

  const loadMaterialsForComponents = async (comps: ProductionComponent[]) => {
    const materialsMap: Record<string, any[]> = {};
    for (const component of comps) {
      try {
        const materials = await productionManagementService.getComponentMaterials(component.id);
        materialsMap[component.id] = materials;
      } catch (error) {
        console.error(`❌ Error loading materials for component ${component.id}:`, error);
        materialsMap[component.id] = [];
      }
    }
    setComponentMaterials(materialsMap);
    
    // Open first component by default
    if (comps.length > 0 && openComponents.length === 0) {
      setOpenComponents([comps[0].id]);
    }
  };

  const loadComponents = async () => {
    try {
      setIsLoading(true);
      const details = await productionManagementService.getItemDetails(item.id);
      
      console.log('🔍 Item Details:', details);
      
      if (details?.components) {
        setComponents(details.components);
        await loadMaterialsForComponents(details.components);
      } else {
        setComponents([]);
      }
    } catch (error) {
      console.error('Error loading components:', error);
      toast.error('Ошибка загрузки компонентов');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComponent = (id: string) => {
    setOpenComponents(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStageClick = async (componentId: string, stageValue: string) => {
    try {
      // Get current component and stage status
      const component = components.find(c => c.id === componentId);
      if (!component?.stages) return;

      const currentStage = component.stages.find(s => s.name === stageValue);
      if (!currentStage) return;

      // Cycle through statuses: pending → in_progress → completed
      let newStatus: 'pending' | 'in_progress' | 'completed';
      if (currentStage.status === 'pending') {
        newStatus = 'in_progress';
      } else if (currentStage.status === 'in_progress') {
        newStatus = 'completed';
      } else {
        newStatus = 'pending';
      }

      await productionManagementService.updateStageStatus(
        currentStage.id,
        newStatus,
        'production_stages'
      );

      toast.success(`Этап "${PRODUCTION_STAGES.find(s => s.value === stageValue)?.label}" обновлен`);
      
      // Reload components
      loadComponents();
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Ошибка обновления этапа');
    }
  };

  // Handle add material
  const handleAddMaterial = async (componentId: string) => {
    setCurrentComponentId(componentId);
    setIsMaterialDialogOpen(true);
  };

  // Handle save material
  const handleSaveMaterial = async (materialData: MaterialFormData) => {
    if (!currentComponentId) return;

    try {
      console.log('💾 Saving material for component:', currentComponentId, materialData);
      
      await productionManagementService.addComponentMaterial(currentComponentId, materialData);
      
      toast.success('Материал добавлен');
      
      // Reload components
      await loadComponents();
    } catch (error) {
      console.error('❌ Error saving material:', error);
      toast.error('Ошибка при сохранении материала');
      throw error;
    }
  };

  // Handle add stage
  const handleAddStage = (componentId: string) => {
    setEditingStageComponentId(componentId);
    setCurrentStage(null);
    setIsStageDialogOpen(true);
  };

  // Handle edit stage
  const handleEditStage = (componentId: string, stage: any) => {
    setEditingStageComponentId(componentId);
    setCurrentStage({
      id: stage.id,
      name: stage.name,
      customLabel: stage.custom_label,
      status: stage.status,
      assignee_id: stage.assignee_id,
      estimated_hours: stage.estimated_hours,
      notes: stage.notes,
    });
    setIsStageDialogOpen(true);
  };

  // Handle save stage
  const handleSaveStage = async (stageData: ProductionStageFormData) => {
    if (!editingStageComponentId) return;

    try {
      if (currentStage?.id) {
        // Update existing stage
        await productionManagementService.updateComponentStage(currentStage.id, {
          name: stageData.name,
          customLabel: stageData.customLabel,
          status: stageData.status,
          assignee_id: stageData.assignee_id,
          estimated_hours: stageData.estimated_hours,
          notes: stageData.notes,
        });
        toast.success('Этап обновлен');
      } else {
        // Add new stage
        await productionManagementService.addComponentStage(editingStageComponentId, stageData);
        toast.success('Этап добавлен');
      }
      
      await loadComponents();
    } catch (error) {
      console.error('Error saving stage:', error);
      toast.error('Ошибка сохранения этапа');
    }
  };

  // Handle delete stage
  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('Удалить этот этап?')) return;

    try {
      await productionManagementService.deleteComponentStage(stageId);
      toast.success('Этап удален');
      await loadComponents();
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast.error('Ошибка удаления этапа');
    }
  };

  // Handle move stage up
  const handleMoveStageUp = async (componentId: string, stageId: string) => {
    try {
      await productionManagementService.moveStageUp(componentId, stageId);
      toast.success('Этап перемещен');
      await loadComponents();
    } catch (error) {
      console.error('Error moving stage:', error);
      toast.error('Ошибка перемещения этапа');
    }
  };

  // Handle move stage down
  const handleMoveStageDown = async (componentId: string, stageId: string) => {
    try {
      await productionManagementService.moveStageDown(componentId, stageId);
      toast.success('Этап перемещен');
      await loadComponents();
    } catch (error) {
      console.error('Error moving stage:', error);
      toast.error('Ошибка перемещения этапа');
    }
  };

  // Handle update material
  const handleUpdateMaterial = async (materialId: string, materialData: any) => {
    try {
      console.log('✏️ Updating material:', materialId, materialData);
      
      await productionManagementService.updateComponentMaterial(materialId, materialData);
      
      toast.success('Материал обновлен');
      
      // Reload components
      await loadComponents();
    } catch (error) {
      console.error('❌ Error updating material:', error);
      toast.error('Ошибка при обновлении материала');
      throw error;
    }
  };

  const openMaterialDetails = (material: any, mode: 'view' | 'edit' = 'view') => {
    setSelectedMaterial(material);
    setMaterialDialogMode(mode);
    setIsMaterialDetailsOpen(true);
  };

  // Handle load documents from client
  const handleLoadClientDocuments = async (componentId: string) => {
    try {
      // TODO: Add API call to load client documents
      toast.info('Загрузка документов из данных клиента скоро будет доступна');
      console.log('Loading documents for component:', componentId);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Ошибка при загрузке документов');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b bg-background">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold">{item.name}</h2>
            <p className="text-sm text-muted-foreground font-mono">{item.code}</p>
          </div>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={onComponentAdd}
          >
            <Plus className="h-4 w-4" />
            Добавить компонент
          </Button>
        </div>

      </div>

      {/* Components List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : components.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Нет компонентов</p>
            <Button size="sm" onClick={onComponentAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить первый компонент
            </Button>
          </div>
        ) : (
          components.map((component) => {
          const isOpen = openComponents.includes(component.id);
          const isCompleted = component.progress === 100;
          const isInProgress = component.progress > 0 && component.progress < 100;
          const isPending = component.progress === 0;

          return (
            <Card
              key={component.id}
              className={cn(
                  "shadow-sm transition-all relative group",
                isCompleted && "border-green-200 bg-green-50/50",
                isInProgress && "border-blue-200 bg-blue-50/50",
                isPending && "border-gray-200"
              )}
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleComponent(component.id)}>
                  {/* Action buttons + toggle */}
                  <div className="absolute top-2 right-2 z-10 flex flex-col items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onComponentEdit?.(component);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onComponentDelete?.(component);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleComponent(component.id);
                      }}
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>

                  <CollapsibleTrigger asChild>
                    <div className="w-full cursor-pointer">
                      <CardContent className="p-4 space-y-3">
                        {/* Header with name and progress */}
                    <div className="flex items-center gap-3">
                      {/* Icon + Name */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="text-2xl flex-shrink-0">📦</div>
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-semibold text-base truncate">{component.name}</div>
                          <div className="text-xs text-muted-foreground">
                                {component.material || 'Без материала'}
                                {component.quantity && ` • ${component.quantity} ${component.unit}`}
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className={cn(
                            "text-lg font-bold",
                            isCompleted && "text-green-600",
                            isInProgress && "text-blue-600",
                            isPending && "text-gray-400"
                          )}>
                            {component.progress}%
                          </div>
                          {isCompleted && (
                            <div className="text-xs text-green-600 font-medium">✓ Готово</div>
                          )}
                              {isInProgress && (
                            <div className="text-xs text-blue-600 font-medium">
                                  В работе
                            </div>
                          )}
                          {isPending && (
                            <div className="text-xs text-gray-400">Не начато</div>
                          )}
                        </div>
                        
                      </div>
                    </div>

                        {/* Compact stages preview (when collapsed) */}
                        {!isOpen && component.stages && component.stages.length > 0 && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 flex-wrap">
                              {component.stages.slice(0, 6).map((stage) => {
                                const isStageCompleted = stage.status === 'completed';
                                const isStageCurrent = stage.status === 'in_progress';
                                const isStageQA = stage.status === 'qa';
                                const stageInfo = PRODUCTION_STAGES.find(s => s.value === stage.name);
                                
                                return (
                                  <DropdownMenu key={stage.id}>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className={cn(
                                          "flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity",
                                          isStageCompleted && "bg-green-100 text-green-700 hover:bg-green-200",
                                          isStageCurrent && "bg-blue-100 text-blue-700 hover:bg-blue-200",
                                          isStageQA && "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                                          !isStageCompleted && !isStageCurrent && !isStageQA && "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <span className="text-sm">{stageInfo?.icon || '⚙️'}</span>
                                        <span className="truncate max-w-[80px]">{stage.custom_label || stageInfo?.label || stage.name}</span>
                                        {isStageCompleted && <span className="ml-1">✓</span>}
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                      <DropdownMenuItem
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await productionManagementService.updateComponentStage(stage.id, {
                                              status: 'pending'
                                            });
                                            toast.success('Статус обновлен');
                                            await loadComponents();
                                          } catch (error) {
                                            toast.error('Ошибка обновления статуса');
                                          }
                                        }}
                                      >
                                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                                        Ожидает
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await productionManagementService.updateComponentStage(stage.id, {
                                              status: 'in_progress'
                                            });
                                            toast.success('Статус обновлен');
                                            await loadComponents();
                                          } catch (error) {
                                            toast.error('Ошибка обновления статуса');
                                          }
                                        }}
                                      >
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                                        В работе
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await productionManagementService.updateComponentStage(stage.id, {
                                              status: 'qa'
                                            });
                                            toast.success('Статус обновлен');
                                            await loadComponents();
                                          } catch (error) {
                                            toast.error('Ошибка обновления статуса');
                                          }
                                        }}
                                      >
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                                        На проверке
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            await productionManagementService.updateComponentStage(stage.id, {
                                              status: 'completed'
                                            });
                                            toast.success('Статус обновлен');
                                            await loadComponents();
                                          } catch (error) {
                                            toast.error('Ошибка обновления статуса');
                                          }
                                        }}
                                      >
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                        Завершено
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                );
                              })}
                              {component.stages.length > 6 && (
                                <span className="text-xs text-muted-foreground">
                                  +{component.stages.length - 6}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                  </CardContent>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 px-4 space-y-4">
                      {/* Section 1: Materials */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            1. МАТЕРИАЛЫ
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMaterial(component.id);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Добавить
                          </Button>
                        </div>
                        {componentMaterials[component.id]?.length > 0 ? (
                          <div className="space-y-1">
                            {componentMaterials[component.id].map((material: any) => (
                              <div key={material.id} className="group flex items-center justify-between text-sm p-2 rounded bg-accent/50 hover:bg-accent transition-colors">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{material.name}</div>
                                  {(material.brand || material.color || material.thickness) && (
                                    <div className="text-xs text-muted-foreground">
                                      {[material.brand, material.color, material.thickness ? `${material.thickness}мм` : null]
                                        .filter(Boolean)
                                        .join(' • ')}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge variant="outline" className="text-xs">
                                    {material.quantity} {UNIT_NAMES[material.unit] || material.unit}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openMaterialDetails(material, 'view');
                                      }}
                                      title="Просмотр"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openMaterialDetails(material, 'edit');
                                      }}
                                      title="Редактировать"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm(`Удалить материал "${material.name}"?`)) {
                                          try {
                                            await productionManagementService.deleteComponentMaterial(material.id);
                                            toast.success('Материал удален');
                                            await loadComponents();
                                          } catch (error) {
                                            console.error('Error deleting material:', error);
                                            toast.error('Ошибка удаления материала');
                                          }
                                        }
                                      }}
                                      title="Удалить"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">
                            Материалы не указаны
                      </div>
                        )}
                    </div>

                      {/* Section 2: Technical Project / Documents */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            2. ТЕХНИЧЕСКИЙ ПРОЕКТ
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadClientDocuments(component.id);
                              }}
                              title="Загрузить из документов клиента"
                            >
                              <Upload className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info('Добавление документов скоро будет доступно');
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Добавить
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground italic">
                          Документы не прикреплены
                            </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Можно подгрузить из документов клиента
                        </div>
                      </div>

                    {/* Parts/Details */}
                      {component.parts && component.parts.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">
                        ДЕТАЛИ
                      </div>
                      <div className="space-y-1">
                            {component.parts.map((part) => (
                              <div key={part.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-accent/50">
                                <div className="flex-1">
                                  <div className="font-medium">{part.name}</div>
                                  {(part.width || part.height || part.depth) && (
                                    <div className="text-xs text-muted-foreground">
                                      {part.width && `${part.width}`}
                                      {part.height && ` × ${part.height}`}
                                      {part.depth && ` × ${part.depth}`}
                                      {' мм'}
                                    </div>
                                  )}
                                </div>
                                <span className="text-muted-foreground ml-2">
                                  {part.quantity} шт
                            </span>
                          </div>
                        ))}
                      </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Open add part dialog
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Добавить деталь
                          </Button>
                    </div>
                      )}

                      {/* Section 3: Production Stages */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            3. ЭТАПЫ ПРОИЗВОДСТВА
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddStage(component.id);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Добавить этап
                          </Button>
                      </div>
                        {component.stages && component.stages.length > 0 ? (
                      <div className="space-y-2">
                            {component.stages.map((stage) => {
                              const isStageCompleted = stage.status === 'completed';
                              const isStageCurrent = stage.status === 'in_progress';
                              const isStagePending = stage.status === 'pending';

                              const stageInfo = PRODUCTION_STAGES.find(s => s.value === stage.name);

                          return (
                            <div
                                  key={stage.id}
                              className={cn(
                                    "w-full flex flex-col gap-2 p-3 rounded-lg transition-all",
                                isStageCompleted && "bg-green-50 border border-green-200",
                                isStageCurrent && "bg-blue-50 border border-blue-200",
                                    isStagePending && "bg-gray-50 border border-gray-200"
                              )}
                            >
                                  <div className="flex items-center gap-3 w-full">
                                    <span className="text-lg">{stageInfo?.icon || '⚙️'}</span>
                              <span className={cn(
                                      "flex-1 text-sm font-medium text-left",
                                isStageCompleted && "text-green-700",
                                isStageCurrent && "text-blue-700",
                                isStagePending && "text-gray-700"
                              )}>
                                      {stage.custom_label || stageInfo?.label || stage.name}
                              </span>
                                    
                                    {/* Status dropdown */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className={cn(
                                            "h-7 text-xs gap-2",
                                            isStageCompleted && "bg-green-100 border-green-300 text-green-700 hover:bg-green-200",
                                            isStageCurrent && "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200",
                                            isStagePending && "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                          )}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            isStageCompleted && "bg-green-500",
                                            isStageCurrent && "bg-blue-500",
                                            isStagePending && "bg-gray-400"
                                          )} />
                                          <span>
                                            {isStageCompleted && 'Завершено'}
                                            {isStageCurrent && 'В работе'}
                                            {isStagePending && 'Ожидает'}
                                            {stage.status === 'qa' && 'На проверке'}
                                          </span>
                                          <ChevronDown className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await productionManagementService.updateComponentStage(stage.id, {
                                                status: 'pending'
                                              });
                                              toast.success('Статус обновлен');
                                              await loadComponents();
                                            } catch (error) {
                                              toast.error('Ошибка обновления статуса');
                                            }
                                          }}
                                        >
                                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                                          Ожидает
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await productionManagementService.updateComponentStage(stage.id, {
                                                status: 'in_progress'
                                              });
                                              toast.success('Статус обновлен');
                                              await loadComponents();
                                            } catch (error) {
                                              toast.error('Ошибка обновления статуса');
                                            }
                                          }}
                                        >
                                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                                          В работе
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await productionManagementService.updateComponentStage(stage.id, {
                                                status: 'qa'
                                              });
                                              toast.success('Статус обновлен');
                                              await loadComponents();
                                            } catch (error) {
                                              toast.error('Ошибка обновления статуса');
                                            }
                                          }}
                                        >
                                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                                          На проверке
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await productionManagementService.updateComponentStage(stage.id, {
                                                status: 'completed'
                                              });
                                              toast.success('Статус обновлен');
                                              await loadComponents();
                                            } catch (error) {
                                              toast.error('Ошибка обновления статуса');
                                            }
                                          }}
                                        >
                                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                          Завершено
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditStage(component.id, stage);
                                          }}
                                        >
                                          <Edit className="mr-2 h-3 w-3" />
                                          Редактировать
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteStage(stage.id);
                                          }}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="mr-2 h-3 w-3" />
                                          Удалить
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                            </div>
                                  
                                  {/* Assignee and deadline info */}
                                  {(stage.assignee_id || stage.estimated_hours || stage.notes) && (
                                    <div className="flex flex-col gap-1 ml-8 text-xs text-muted-foreground">
                                      {stage.assignee_id && (
                                        <span>👤 Исполнитель</span>
                                      )}
                                      {stage.estimated_hours && (
                                        <span>⏱️ {stage.estimated_hours}ч</span>
                                      )}
                                      {stage.notes && (
                                        <span className="italic">💬 {stage.notes}</span>
                                      )}
                                    </div>
                                  )}
                            </div>
                          );
                        })}
                      </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">
                            Этапы производства не настроены
                          </div>
                        )}
                    </div>

                    {/* Component Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Прогресс компонента
                        </span>
                        <span className="text-xs font-bold">{component.progress}%</span>
                      </div>
                      <Progress value={component.progress} className="h-2" />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
          })
        )}
      </div>

      {/* Add Material Dialog */}
      <AddMaterialDialog
        open={isMaterialDialogOpen}
        onOpenChange={setIsMaterialDialogOpen}
        onSave={handleSaveMaterial}
      />
      
      <MaterialDetailsDialog
        open={isMaterialDetailsOpen}
        onOpenChange={setIsMaterialDetailsOpen}
        material={selectedMaterial}
        onSave={handleUpdateMaterial}
        mode={materialDialogMode}
      />

      {/* Production Stage Dialog */}
      <ProductionStageDialog
        open={isStageDialogOpen}
        onOpenChange={setIsStageDialogOpen}
        stage={currentStage}
        onSave={handleSaveStage}
        users={[]} // TODO: Pass users list if needed
      />
    </div>
  );
}
