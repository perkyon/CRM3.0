import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft, 
  Search, 
  Plus,
  Settings,
  ListTree,
  Trash2,
  MoreVertical,
  Edit,
  FolderOpen
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  productionManagementService,
  ProductionZone,
  ProductionItem as ProdItem,
  ProductionComponent
} from '../../lib/supabase/services/ProductionManagementService';
import { useProjects } from '../../contexts/ProjectContextNew';
import { toast } from '../../lib/toast';
import { cn, formatDate } from '../../lib/utils';
import { ZoneDialog } from '../production/ZoneDialog';
import { DeleteZoneDialog } from '../production/DeleteZoneDialog';
import { ItemDialog, ItemFormData } from '../production/ItemDialog';
import { DeleteItemDialog } from '../production/DeleteItemDialog';
import { ItemDetailsPanel } from '../production/ItemDetailsPanel';
import { ComponentDialog, ComponentFormData } from '../production/ComponentDialog';
import { useProductionRealtime } from '../../lib/hooks/useProductionRealtime';

export function ProductionManager() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  
  const [zones, setZones] = useState<ProductionZone[]>([]);
  const [items, setItems] = useState<ProdItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProdItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Zone dialog states
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [zoneDialogMode, setZoneDialogMode] = useState<'create' | 'edit'>('create');
  const [editingZone, setEditingZone] = useState<ProductionZone | null>(null);
  
  // Delete zone dialog states
  const [isDeleteZoneDialogOpen, setIsDeleteZoneDialogOpen] = useState(false);
  const [deletingZone, setDeletingZone] = useState<ProductionZone | null>(null);
  
  // Item dialog states
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [itemDialogMode, setItemDialogMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<ProdItem | null>(null);
  
  // Delete item dialog states
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ProdItem | null>(null);

  // Component dialog states
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [componentDialogMode, setComponentDialogMode] = useState<'create' | 'edit'>('create');
  const [editingComponent, setEditingComponent] = useState<ProductionComponent | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<ProductionComponent | null>(null);

  const project = projects.find(p => p.id === projectId);

  const loadProductionData = useCallback(async (showLoading = true) => {
    if (!projectId) return;
    
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      // Load zones and items
      const [zonesData, itemsData] = await Promise.all([
        productionManagementService.getProjectZones(projectId),
        productionManagementService.getProjectItems(projectId)
      ]);
      
      setZones(zonesData);
      setItems(itemsData);
      
      // Auto-select first item only on initial load
      if (itemsData.length > 0 && !selectedItem && showLoading) {
        setSelectedItem(itemsData[0]);
      }
    } catch (error) {
      console.error('Error loading production data:', error);
      toast.error('Ошибка загрузки производства');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [projectId]);

  // Initial data load
  useEffect(() => {
    if (projectId) {
      loadProductionData();
    } else {
      setIsLoading(false);
    }
  }, [projectId, loadProductionData]);

  // Real-time subscription with debounce
  useProductionRealtime({
    projectId,
    onUpdate: () => {
      // Realtime обновления без показа loading
      loadProductionData(false);
    },
  });

  // Filter items by selected zone
  const filteredItems = React.useMemo(() => {
    if (!selectedZone) return items;
    const zone = zones.find(z => z.id === selectedZone);
    return items.filter(item => item.zone_id === zone?.id);
  }, [items, selectedZone, zones]);

  // Handle create zone
  const handleCreateZone = async (name: string) => {
    if (!projectId) return;
    
    try {
      const newZone = await productionManagementService.createZone(projectId, name);
      // Оптимистичное обновление - сразу добавляем в состояние
      setZones(prev => [...prev, newZone].sort((a, b) => a.position - b.position));
      toast.success('Зона успешно создана');
    } catch (error) {
      console.error('Error creating zone:', error);
      toast.error('Ошибка при создании зоны');
      // При ошибке перезагружаем данные
      await loadProductionData();
      throw error;
    }
  };

  // Handle edit zone
  const handleEditZone = async (name: string) => {
    if (!editingZone) return;
    
    try {
      await productionManagementService.updateZoneName(editingZone.id, name);
      // Оптимистичное обновление - сразу обновляем в состоянии
      setZones(prev => prev.map(z => z.id === editingZone.id ? { ...z, name } : z));
      toast.success('Зона успешно переименована');
    } catch (error) {
      console.error('Error updating zone:', error);
      toast.error('Ошибка при обновлении зоны');
      await loadProductionData();
      throw error;
    }
  };

  // Handle delete zone
  const handleDeleteZone = async () => {
    if (!deletingZone) return;
    
    const zoneIdToDelete = deletingZone.id;
    
    try {
      await productionManagementService.deleteZone(zoneIdToDelete);
      // Оптимистичное обновление - сразу удаляем из состояния
      setZones(prev => prev.filter(z => z.id !== zoneIdToDelete));
      setItems(prev => prev.filter(i => i.zone_id !== zoneIdToDelete));
      toast.success('Зона успешно удалена');
      
      // Clear selection if deleted zone was selected
      if (selectedZone === zoneIdToDelete) {
        setSelectedZone(null);
      }
      
      // Close dialog
      setIsDeleteZoneDialogOpen(false);
      setDeletingZone(null);
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Ошибка при удалении зоны');
      await loadProductionData();
    }
  };

  // Open delete zone dialog
  const openDeleteZoneDialog = (zone: ProductionZone) => {
    setDeletingZone(zone);
    setIsDeleteZoneDialogOpen(true);
  };

  // Open create zone dialog
  const openCreateZoneDialog = () => {
    setZoneDialogMode('create');
    setEditingZone(null);
    setIsZoneDialogOpen(true);
  };

  // Open edit zone dialog
  const openEditZoneDialog = (zone: ProductionZone) => {
    setZoneDialogMode('edit');
    setEditingZone(zone);
    setIsZoneDialogOpen(true);
  };

  // Handle create item
  const handleCreateItem = async (itemData: ItemFormData) => {
    if (!projectId || !selectedZone) return;
    
    try {
      const newItem = await productionManagementService.createItem({
        projectId,
        zoneId: selectedZone,
        code: itemData.code,
        name: itemData.name,
        quantity: itemData.quantity || 1,
        currentStage: itemData.currentStage,
        materials: itemData.materials,
        technicalNotes: itemData.technicalNotes,
        comment: itemData.comment,
        dueDate: itemData.dueDate,
      });
      
      // Оптимистичное обновление - сразу добавляем в состояние
      setItems(prev => [...prev, newItem].sort((a, b) => a.position - b.position));
      toast.success('Изделие успешно создано');
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Ошибка при создании изделия');
      await loadProductionData();
      throw error;
    }
  };

  // Handle edit item
  const handleEditItem = async (itemData: ItemFormData) => {
    if (!editingItem) return;
    
    try {
      await productionManagementService.updateItem(
        editingItem.id,
        {
          code: itemData.code,
          name: itemData.name,
          quantity: itemData.quantity || 1,
          currentStage: itemData.currentStage,
          materials: itemData.materials,
          technicalNotes: itemData.technicalNotes,
          comment: itemData.comment,
          dueDate: itemData.dueDate,
        }
      );
      
      // Оптимистичное обновление - сразу обновляем в состоянии
      setItems(prev => prev.map(i => 
        i.id === editingItem.id 
          ? { 
              ...i, 
              code: itemData.code, 
              name: itemData.name, 
              quantity: itemData.quantity || 1, 
              current_stage: itemData.currentStage,
              materials: itemData.materials,
              technical_notes: itemData.technicalNotes,
              manager_comment: itemData.comment,
              due_date: itemData.dueDate,
            }
          : i
      ));
      
      // Обновляем selectedItem если он редактировался
      if (selectedItem?.id === editingItem.id) {
        setSelectedItem(prev => prev ? {
          ...prev,
          code: itemData.code,
          name: itemData.name,
          quantity: itemData.quantity || 1,
          current_stage: itemData.currentStage,
          materials: itemData.materials,
          technical_notes: itemData.technicalNotes,
          manager_comment: itemData.comment,
          due_date: itemData.dueDate,
        } : null);
      }
      
      toast.success('Изделие успешно обновлено');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Ошибка при обновлении изделия');
      await loadProductionData();
      throw error;
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    
    const itemIdToDelete = deletingItem.id;
    
    try {
      await productionManagementService.deleteItem(itemIdToDelete);
      
      // Оптимистичное обновление - сразу удаляем из состояния
      setItems(prev => prev.filter(i => i.id !== itemIdToDelete));
      toast.success('Изделие успешно удалено');
      
      // Clear selection if deleted item was selected
      if (selectedItem?.id === itemIdToDelete) {
        setSelectedItem(null);
      }
      
      // Close dialog
      setIsDeleteItemDialogOpen(false);
      setDeletingItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Ошибка при удалении изделия');
      await loadProductionData();
    }
  };

  // Open create item dialog
  const openCreateItemDialog = () => {
    if (!selectedZone) {
      toast.error('Выберите зону для добавления изделия');
      return;
    }
    setItemDialogMode('create');
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  // Open edit item dialog
  const openEditItemDialog = (item: ProdItem) => {
    setItemDialogMode('edit');
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  // Open delete item dialog
  const openDeleteItemDialog = (item: ProdItem) => {
    setDeletingItem(item);
    setIsDeleteItemDialogOpen(true);
  };

  // Handle component add
  const handleComponentAdd = () => {
    if (!selectedItem) {
      toast.error('Выберите изделие для добавления компонента');
      return;
    }
    setComponentDialogMode('create');
    setEditingComponent(null);
    setIsComponentDialogOpen(true);
  };

  // Handle component edit
  const handleComponentEdit = (component: ProductionComponent) => {
    setComponentDialogMode('edit');
    setEditingComponent(component);
    setIsComponentDialogOpen(true);
  };

  // Handle component delete
  const handleComponentDelete = (component: ProductionComponent) => {
    setDeletingComponent(component);
  };

  // Confirm component delete
  const confirmComponentDelete = async () => {
    if (!deletingComponent) return;
    
    const componentIdToDelete = deletingComponent.id;
    
    try {
      await productionManagementService.deleteComponent(componentIdToDelete);
      
      // Оптимистичное обновление - удаляем компонент из selectedItem
      if (selectedItem) {
        const updatedItem = {
          ...selectedItem,
          components: (selectedItem.components || []).filter(c => c.id !== componentIdToDelete)
        };
        setSelectedItem(updatedItem);
        
        // Также обновляем в списке items
        setItems(prev => prev.map(i => 
          i.id === selectedItem.id ? updatedItem : i
        ));
      }
      
      toast.success('Компонент успешно удален');
      
      // Close dialog
      setDeletingComponent(null);
    } catch (error) {
      console.error('Error deleting component:', error);
      toast.error('Ошибка при удалении компонента');
      // Перезагружаем данные для обновления selectedItem
      if (selectedItem) {
        try {
          const itemDetails = await productionManagementService.getItemDetails(selectedItem.id);
          if (itemDetails) {
            setSelectedItem(itemDetails);
          }
        } catch (reloadError) {
          console.error('Error reloading item details:', reloadError);
        }
      }
    }
  };

  // Handle component save
  const handleComponentSave = async (componentData: ComponentFormData) => {
    if (!selectedItem && componentDialogMode === 'create') return;
    
    try {
      if (componentDialogMode === 'create') {
        const newComponent = await productionManagementService.createComponent(
          selectedItem!.id,
          componentData.name,
          componentData.material,
          componentData.quantity,
          componentData.unit,
          componentData.templateId
        );
        
        // Оптимистичное обновление - обновляем selectedItem с новым компонентом
        if (selectedItem) {
          const updatedItem = {
            ...selectedItem,
            components: [...(selectedItem.components || []), newComponent]
          };
          setSelectedItem(updatedItem);
          
          // Также обновляем в списке items
          setItems(prev => prev.map(i => 
            i.id === selectedItem.id ? updatedItem : i
          ));
        }
        
        toast.success('Компонент успешно добавлен');
      } else if (componentDialogMode === 'edit' && editingComponent) {
        // Update component (note: ProductionManagementService doesn't have updateComponent yet)
        // For now, we'll show a message
        toast.info('Функция редактирования компонента скоро будет доступна');
        return;
      }
    } catch (error) {
      console.error('Error saving component:', error);
      toast.error('Ошибка при сохранении компонента');
      // Перезагружаем данные для обновления selectedItem
      if (selectedItem) {
        try {
          const itemDetails = await productionManagementService.getItemDetails(selectedItem.id);
          if (itemDetails) {
            setSelectedItem(itemDetails);
          }
        } catch (reloadError) {
          console.error('Error reloading item details:', reloadError);
        }
      }
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Загрузка производства...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                // Находим проект чтобы получить code
                const project = projects?.find(p => p.id === projectId);
                navigate(`/app/projects/${project?.code || projectId}`);
              }}
            >
              <ArrowLeft className="size-4 mr-2" />
              Назад к проекту
            </Button>
            <div className="border-l h-6"></div>
            <div>
              <div className="flex items-center gap-3">
                <ListTree className="size-5 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold">Производство</h1>
                  <p className="text-sm text-muted-foreground">
                    {project?.title || 'Проект'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Zones */}
        <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto flex-shrink-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">
              Зоны
            </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={openCreateZoneDialog}
                className="h-6 w-6 p-0"
                title="Добавить зону"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <button
              onClick={() => setSelectedZone(null)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors",
                !selectedZone ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Все зоны</span>
                <span className="text-sm">{items.length} шт.</span>
              </div>
            </button>

            {zones.map(zone => {
              const zoneItems = items.filter(item => item.zone_id === zone.id);
              const completedItems = zoneItems.filter(item => item.progress === 100).length;
              
              return (
                <div
                  key={zone.id}
                  className={cn(
                    "group relative rounded-lg transition-colors",
                    selectedZone === zone.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedZone(zone.id)}
                      className="flex-1 text-left p-3 min-w-0"
                    >
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="font-medium truncate">{zone.name}</span>
                        <span className="text-sm shrink-0">{zone.progress}%</span>
                      </div>
                      <div className="space-y-1">
                        <Progress value={zone.progress} className="h-1" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{completedItems} / {zoneItems.length} изд.</span>
                        </div>
                      </div>
                    </button>
                    
                    {/* Dropdown menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditZoneDialog(zone);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Переименовать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteZoneDialog(zone);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center - Items List */}
        <div className="w-80 border-r overflow-y-auto flex-shrink-0">
          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats + Add Button */}
            <div className="mb-6 flex items-center justify-between">
              <div>
              <div className="text-sm text-muted-foreground">
                ИЗДЕЛИЯ
              </div>
              <div className="text-2xl font-semibold">
                {filteredItems.length} шт.
              </div>
              </div>
              <Button
                onClick={openCreateItemDialog}
                size="sm"
                className="gap-2"
                disabled={!selectedZone}
              >
                <Plus className="h-4 w-4" />
                Добавить изделие
              </Button>
            </div>

            {/* Items Table */}
            {(() => {
              const searchFilteredItems = filteredItems.filter(item => 
                  !searchQuery || 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.code?.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return searchFilteredItems.length > 0 && (
                <div className="space-y-2">
                  {searchFilteredItems.map(item => {
                    const isCompleted = item.current_stage === 'completed';
                    const isInProgress = item.current_stage && item.current_stage !== 'plan' && !isCompleted;
                    const zoneName = zones.find(z => z.id === item.zone_id)?.name || 'Без зоны';
                    
                    return (
                      <div key={item.id} className="flex items-stretch gap-2 group">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            "flex-1 rounded-2xl transition-all duration-300 text-left overflow-hidden border bg-card/90 shadow-sm",
                            selectedItem?.id === item.id 
                              ? "border-primary/60 shadow-lg ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 via-background to-background"
                              : "border-transparent hover:border-border hover:shadow-md"
                          )}
                        >
                          <div className="p-4 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div className={cn(
                                  "w-2.5 h-2.5 mt-1 rounded-full flex-shrink-0",
                                  isCompleted ? "bg-emerald-500" :
                                  isInProgress ? "bg-blue-500" :
                                  "bg-gray-300"
                                )} />
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-base text-foreground break-words leading-tight">
                                    {item.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1">
                                    <span className="truncate">{item.code || 'Изделие'}</span>
                                    <span className="text-muted-foreground/50">•</span>
                                    <span className="truncate">{zoneName}</span>
                                  </div>
                                </div>
                              </div>

                              <Badge 
                                variant={isCompleted ? 'default' : isInProgress ? 'secondary' : 'outline'}
                                className={cn(
                                  "font-medium flex-shrink-0 whitespace-nowrap px-3 py-1 rounded-full",
                                  isCompleted && "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
                                  isInProgress && "bg-blue-100 text-blue-900 hover:bg-blue-100"
                                )}
                              >
                                {item.current_stage === 'completed' ? '✓ Готово' :
                                 item.current_stage === 'cutting' ? 'Раскрой' :
                                 item.current_stage === 'edging' ? 'Кромка' :
                                 item.current_stage === 'drilling' ? 'Присадка' :
                                 item.current_stage === 'assembly' ? 'Сборка' :
                                 item.current_stage === 'finishing' ? 'Отделка' :
                                 item.current_stage === 'packaging' ? 'Упаковка' :
                                 'План'}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                              <div>
                                <div className="uppercase tracking-wide text-[10px] text-muted-foreground/70 mb-1">
                                  Срок
                                </div>
                                <div className="text-sm font-semibold text-foreground">
                                  {item.due_date ? formatDate(item.due_date) : 'Не задан'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="uppercase tracking-wide text-[10px] text-muted-foreground/70 mb-1">
                                  Прогресс
                                </div>
                                <div className="text-sm font-semibold text-foreground">
                                  {item.progress}%
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Progress value={item.progress} className="h-2 rounded-full bg-muted" />
                            </div>
                          </div>
                        </button>
                        
                        {/* Dropdown Menu - to the right of card */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center self-start mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditItemDialog(item);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteItemDialog(item);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Sidebar - Details */}
        {selectedItem && (
          <div className="flex-1 bg-muted/30 overflow-y-auto shadow-lg">
            <ItemDetailsPanel
              item={selectedItem}
              onEdit={openEditItemDialog}
              onDelete={openDeleteItemDialog}
              onComponentAdd={handleComponentAdd}
              onComponentEdit={handleComponentEdit}
              onComponentDelete={handleComponentDelete}
            />
          </div>
        )}
      </div>

      {/* Zone Dialog */}
      <ZoneDialog
        open={isZoneDialogOpen}
        onOpenChange={setIsZoneDialogOpen}
        onSave={zoneDialogMode === 'create' ? handleCreateZone : handleEditZone}
        initialName={editingZone?.name || ''}
        mode={zoneDialogMode}
      />

      {/* Delete Zone Dialog */}
      <DeleteZoneDialog
        open={isDeleteZoneDialogOpen}
        onOpenChange={setIsDeleteZoneDialogOpen}
        onConfirm={handleDeleteZone}
        zoneName={deletingZone?.name || ''}
      />

      {/* Item Dialog */}
      <ItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        onSave={itemDialogMode === 'create' ? handleCreateItem : handleEditItem}
        initialData={editingItem ? {
          code: editingItem.code,
          name: editingItem.name,
          quantity: editingItem.quantity,
          currentStage: editingItem.current_stage || 'plan',
          materials: editingItem.materials || '',
          technicalNotes: editingItem.technical_notes || '',
          comment: editingItem.manager_comment || editingItem.notes || '',
          dueDate: editingItem.due_date || '',
        } : undefined}
        mode={itemDialogMode}
        projectId={projectId}
      />

      {/* Delete Item Dialog */}
      <DeleteItemDialog
        open={isDeleteItemDialogOpen}
        onOpenChange={setIsDeleteItemDialogOpen}
        onConfirm={handleDeleteItem}
        itemName={deletingItem?.name || ''}
      />

      {/* Component Dialog */}
      <ComponentDialog
        open={isComponentDialogOpen}
        onOpenChange={setIsComponentDialogOpen}
        onSave={handleComponentSave}
        initialData={editingComponent ? {
          name: editingComponent.name,
          quantity: editingComponent.quantity,
          unit: editingComponent.unit,
        } : undefined}
        mode={componentDialogMode}
      />

      {/* Delete Component Confirmation Dialog */}
      {deletingComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Удалить компонент?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Вы уверены, что хотите удалить компонент <span className="font-semibold">"{deletingComponent.name}"</span>? Это действие нельзя отменить.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeletingComponent(null)}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={confirmComponentDelete}
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

