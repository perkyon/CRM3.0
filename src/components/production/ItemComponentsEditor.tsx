import React, { useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { ComponentDialog, ComponentFormData } from './ComponentDialog';
import { AddMaterialDialog, MaterialFormData, MATERIAL_TYPE_NAMES } from './AddMaterialDialog';
import { MaterialDetailsDialog } from './MaterialDetailsDialog';

export interface MaterialDraft extends MaterialFormData {
  id: string;
  isNew?: boolean;
  isDeleted?: boolean;
  isDirty?: boolean;
}

export interface ComponentDraft extends ComponentFormData {
  id: string;
  materials: MaterialDraft[];
  isNew?: boolean;
  isDeleted?: boolean;
  isDirty?: boolean;
}

interface ItemComponentsEditorProps {
  value: ComponentDraft[];
  onChange: (next: ComponentDraft[]) => void;
  isLoading?: boolean;
}

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9);

export function ItemComponentsEditor({ value, onChange, isLoading }: ItemComponentsEditorProps) {
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [componentDialogMode, setComponentDialogMode] = useState<'create' | 'edit'>('create');
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  const [addMaterialComponentId, setAddMaterialComponentId] = useState<string | null>(null);
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialDraft | null>(null);
  const [materialDialogMode, setMaterialDialogMode] = useState<'view' | 'edit'>('view');
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);

  const visibleComponents = useMemo(
    () => value.filter((component) => !component.isDeleted),
    [value],
  );

  const currentComponent = activeComponentId
    ? value.find((component) => component.id === activeComponentId) || null
    : null;

  const componentDialogInitialData: ComponentFormData | undefined =
    componentDialogMode === 'edit' && currentComponent
      ? {
          name: currentComponent.name,
          quantity: currentComponent.quantity,
          unit: currentComponent.unit,
          material: currentComponent.material,
          templateId: currentComponent.templateId,
        }
      : undefined;

  const handleComponentSave = (data: ComponentFormData) => {
    if (componentDialogMode === 'create') {
      const newComponent: ComponentDraft = {
        ...data,
        id: generateId(),
        materials: [],
        isNew: true,
      };
      onChange([...value, newComponent]);
    } else if (currentComponent) {
      onChange(
        value.map((component) =>
          component.id === currentComponent.id
            ? {
                ...component,
                ...data,
                isDirty: component.isNew ? component.isDirty : true,
              }
            : component,
        ),
      );
    }
    setComponentDialogOpen(false);
    setActiveComponentId(null);
  };

  const handleDeleteComponent = (componentId: string) => {
    const target = value.find((component) => component.id === componentId);
    if (!target) return;

    if (target.isNew) {
      onChange(value.filter((component) => component.id !== componentId));
    } else {
      onChange(
        value.map((component) =>
          component.id === componentId ? { ...component, isDeleted: true } : component,
        ),
      );
    }
  };

  const handleAddMaterial = (componentId: string) => {
    setAddMaterialComponentId(componentId);
    setIsAddMaterialDialogOpen(true);
  };

  const handleSaveMaterial = (materialData: MaterialFormData) => {
    if (!addMaterialComponentId) return;
    onChange(
      value.map((component) =>
        component.id === addMaterialComponentId
          ? {
              ...component,
              materials: [
                ...component.materials,
                {
                  ...materialData,
                  id: generateId(),
                  isNew: true,
                },
              ],
            }
          : component,
      ),
    );
    setIsAddMaterialDialogOpen(false);
    setAddMaterialComponentId(null);
  };

  const handleMaterialUpdate = (materialId: string, updates: Partial<MaterialDraft>) => {
    onChange(
      value.map((component) => ({
        ...component,
        materials: component.materials.map((material) =>
          material.id === materialId
            ? {
                ...material,
                ...updates,
                isDirty: material.isNew ? material.isDirty : true,
              }
            : material,
        ),
      })),
    );
  };

  const handleDeleteMaterial = (componentId: string, materialId: string) => {
    onChange(
      value.map((component) => {
        if (component.id !== componentId) return component;
        return {
          ...component,
          materials: component.materials
            .map((material) =>
              material.id === materialId
                ? material.isNew
                  ? null
                  : { ...material, isDeleted: true }
                : material,
            )
            .filter(Boolean) as MaterialDraft[],
        };
      }),
    );
  };

  const openMaterialDialog = (_componentId: string, material: MaterialDraft, mode: 'view' | 'edit') => {
    setSelectedMaterial(material);
    setMaterialDialogMode(mode);
    setIsMaterialDialogOpen(true);
  };

  const materialsToRender = (component: ComponentDraft) =>
    component.materials.filter((material) => !material.isDeleted);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            Компоненты
            <Badge variant="secondary">{visibleComponents.length}</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Фасады, каркасы, столешницы и другие части изделия
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="gap-2"
          onClick={() => {
            setComponentDialogMode('create');
            setActiveComponentId(null);
            setComponentDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Добавить компонент
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          Загрузка компонентов...
        </div>
      ) : visibleComponents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-muted-foreground">
          Пока нет компонентов
        </div>
      ) : (
        visibleComponents.map((component) => (
          <Card key={component.id} className="border border-border/80 shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="min-w-0 space-y-1">
                <div className="font-semibold">{component.name}</div>
                <div className="text-xs text-muted-foreground">
                  {component.quantity} {component.unit}
                </div>
                {component.material && (
                  <div className="text-xs text-muted-foreground">
                    Материал: {component.material}
                  </div>
                )}
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
                      setComponentDialogMode('edit');
                      setActiveComponentId(component.id);
                      setComponentDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddMaterial(component.id)}>
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

            <div className="px-4 pb-4 space-y-2">
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

              {materialsToRender(component).length === 0 ? (
                <div className="text-xs text-muted-foreground italic">Материалы не указаны</div>
              ) : (
                materialsToRender(component).map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                <div className="font-semibold text-foreground truncate">
                  {MATERIAL_TYPE_NAMES[material.materialType] || material.materialType}
                </div>
                {(() => {
                  const metaParts = [
                    material.brand,
                    material.color,
                    material.thickness ? `${material.thickness}мм` : null,
                  ].filter(Boolean);
                  return (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{material.name || '—'}</span>
                      {metaParts.length > 0 && (
                        <span className="ml-1 text-muted-foreground/80">• {metaParts.join(' • ')}</span>
                      )}
                    </div>
                  );
                })()}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {material.quantity} {material.unit}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Просмотр"
                        onClick={() => openMaterialDialog(component.id, material, 'view')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Редактировать"
                        onClick={() => openMaterialDialog(component.id, material, 'edit')}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        title="Удалить"
                        onClick={() => handleDeleteMaterial(component.id, material.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))
      )}

      <ComponentDialog
        open={componentDialogOpen}
        onOpenChange={(state) => {
          setComponentDialogOpen(state);
          if (!state) {
            setActiveComponentId(null);
          }
        }}
        mode={componentDialogMode}
        initialData={componentDialogInitialData}
        onSave={async (data) => {
          handleComponentSave(data);
        }}
      />

      <AddMaterialDialog
        open={isAddMaterialDialogOpen}
        onOpenChange={(state) => {
          setIsAddMaterialDialogOpen(state);
          if (!state) {
            setAddMaterialComponentId(null);
          }
        }}
        onSave={async (data) => {
          handleSaveMaterial(data);
        }}
      />

      <MaterialDetailsDialog
        open={isMaterialDialogOpen}
        onOpenChange={(state) => {
          setIsMaterialDialogOpen(state);
          if (!state) {
            setSelectedMaterial(null);
          }
        }}
        material={selectedMaterial}
        mode={materialDialogMode}
        onSave={async (_id, data) => {
          if (!selectedMaterial) return;
          handleMaterialUpdate(selectedMaterial.id, data);
          setIsMaterialDialogOpen(false);
          setSelectedMaterial(null);
        }}
      />
    </div>
  );
}

