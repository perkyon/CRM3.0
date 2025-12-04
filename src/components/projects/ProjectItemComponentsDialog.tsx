import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, MoreVertical, Plus, Trash2, Layers3, Edit, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ComponentDialog, ComponentFormData } from '../production/ComponentDialog';
import { AddMaterialDialog, MaterialFormData } from '../production/AddMaterialDialog';
import { MaterialDetailsDialog } from '../production/MaterialDetailsDialog';
import {
  ProductionComponent,
  ProductionItem,
  productionManagementService,
} from '../../lib/supabase/services/ProductionManagementService';
import { toast } from '../../lib/toast';
import { cn } from '../../lib/utils';

interface ProjectItemComponentsDialogProps {
  item: ProductionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function ProjectItemComponentsDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: ProjectItemComponentsDialogProps) {
  const [components, setComponents] = useState<ProductionComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [componentDialogMode, setComponentDialogMode] = useState<'create' | 'edit'>('create');
  const [activeComponent, setActiveComponent] = useState<ProductionComponent | null>(null);
  const [materialMap, setMaterialMap] = useState<Record<string, any[]>>({});
  const [addMaterialFor, setAddMaterialFor] = useState<string | null>(null);
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [materialDialogMode, setMaterialDialogMode] = useState<'view' | 'edit'>('view');
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);

  useEffect(() => {
    if (open && item) {
      loadData();
    }
  }, [open, item?.id]);

  const loadData = async () => {
    if (!item) return;
    try {
      setIsLoading(true);
      const details = await productionManagementService.getItemDetails(item.id);
      const comps = details?.components || [];
      setComponents(comps);
      const materials: Record<string, any[]> = {};
      for (const comp of comps) {
        try {
          materials[comp.id] = await productionManagementService.getComponentMaterials(comp.id);
        } catch (error) {
          console.error('Error loading materials:', error);
          materials[comp.id] = [];
        }
      }
      setMaterialMap(materials);
      onUpdated?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleComponentSave = async (formData: ComponentFormData) => {
    if (!item) return;
    try {
      if (componentDialogMode === 'create') {
        await productionManagementService.createComponent(
          item.id,
          formData.name,
          formData.material,
          formData.quantity,
          formData.unit,
          formData.templateId,
        );
      } else if (activeComponent) {
        await productionManagementService.updateComponent(activeComponent.id, {
          name: formData.name,
          material: formData.material,
          quantity: formData.quantity,
          unit: formData.unit,
        });
      }
      await loadData();
    } catch (error) {
      console.error('Error saving component:', error);
      toast.error('Не удалось сохранить компонент');
      throw error;
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    if (!confirm('Удалить компонент и все его материалы?')) return;
    try {
      await productionManagementService.deleteComponent(componentId);
      await loadData();
    } catch (error) {
      console.error('Error deleting component:', error);
      toast.error('Ошибка удаления компонента');
    }
  };

  const handleAddMaterial = (componentId: string) => {
    setAddMaterialFor(componentId);
    setIsAddMaterialDialogOpen(true);
  };

  const handleSaveMaterial = async (materialData: MaterialFormData) => {
    if (!addMaterialFor) return;
    try {
      await productionManagementService.addComponentMaterial(addMaterialFor, materialData);
      setIsAddMaterialDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Не удалось сохранить материал');
      throw error;
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Удалить материал?')) return;
    try {
      await productionManagementService.deleteComponentMaterial(materialId);
      await loadData();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Ошибка удаления материала');
    }
  };

  const handleMaterialUpdate = async (materialId: string, updated: any) => {
    try {
      await productionManagementService.updateComponentMaterial(materialId, updated);
      setIsMaterialDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error('Ошибка обновления материала');
      throw error;
    }
  };

  const openMaterialDetails = (material: any, mode: 'view' | 'edit') => {
    setSelectedMaterial(material);
    setMaterialDialogMode(mode);
    setIsMaterialDialogOpen(true);
  };

  const renderMaterials = (component: ProductionComponent) => {
    const materials = materialMap[component.id] || [];
    if (!materials.length) {
      return <div className="text-xs text-muted-foreground italic">Материалы не указаны</div>;
    }

    return (
      <div className="space-y-2">
        {materials.map((material) => (
          <div
            key={material.id}
            className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{material.name}</div>
              <div className="text-xs text-muted-foreground">
                {material.brand && `${material.brand} • `}
                {material.color && `${material.color} • `}
                {material.thickness ? `${material.thickness}мм` : ''}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                {material.quantity} {material.unit}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => openMaterialDetails(material, 'view')}
                title="Просмотр"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => openMaterialDetails(material, 'edit')}
                title="Редактировать"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive"
                onClick={() => handleDeleteMaterial(material.id)}
                title="Удалить"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const componentCount = useMemo(() => components.length, [components]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl">
                  Компоненты изделия
                </DialogTitle>
                {item && (
                  <p className="text-sm text-muted-foreground">
                    {item.name} • {componentCount} компонента(ов)
                  </p>
                )}
              </div>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  setActiveComponent(null);
                  setComponentDialogMode('create');
                  setComponentDialogOpen(true);
                }}
                disabled={!item}
              >
                <Layers3 className="h-4 w-4" />
                Добавить компонент
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Загрузка компонентов...
              </div>
            ) : components.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Нет компонентов. Добавьте первый компонент.
              </div>
            ) : (
              components.map((component) => (
                <Card key={component.id} className="border border-border/80 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-base">{component.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {component.quantity} {component.unit}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setActiveComponent(component);
                              setComponentDialogMode('edit');
                              setComponentDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAddMaterial(component.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить материал
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteComponent(component.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
                        <span>Материалы</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => handleAddMaterial(component.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Добавить
                        </Button>
                      </div>
                      {renderMaterials(component)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ComponentDialog
        open={componentDialogOpen}
        onOpenChange={setComponentDialogOpen}
        mode={componentDialogMode}
        initialData={
          componentDialogMode === 'edit' && activeComponent
            ? {
                name: activeComponent.name,
                quantity: activeComponent.quantity,
                unit: activeComponent.unit,
                material: activeComponent.material || undefined,
              }
            : undefined
        }
        onSave={handleComponentSave}
      />

      <AddMaterialDialog
        open={isAddMaterialDialogOpen}
        onOpenChange={setIsAddMaterialDialogOpen}
        onSave={handleSaveMaterial}
      />

      <MaterialDetailsDialog
        open={isMaterialDialogOpen}
        onOpenChange={setIsMaterialDialogOpen}
        material={selectedMaterial}
        onSave={handleMaterialUpdate}
        mode={materialDialogMode}
      />
    </>
  );
}

