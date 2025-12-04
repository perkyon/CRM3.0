import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { TechnicalDocumentSelector } from './TechnicalDocumentSelector';
import { ItemComponentsEditor, ComponentDraft } from './ItemComponentsEditor';
import type { MaterialDraft } from './ItemComponentsEditor';
import { MaterialFormData } from './AddMaterialDialog';
import {
  productionManagementService,
  ProductionItem,
} from '../../lib/supabase/services/ProductionManagementService';
import { toast } from '../../lib/toast';

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (itemData: ItemFormData) => Promise<ProductionItem | null>;
  initialData?: ItemFormData;
  mode: 'create' | 'edit';
  projectId?: string;
  itemId?: string;
}

export interface ItemFormData {
  code: string;
  name: string;
  quantity?: number;
  currentStage?: string;
  materials?: string;
  technicalNotes?: string;
  comment?: string;
  dueDate?: string;
  components?: ComponentDraft[];
}

export function ItemDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
  mode,
  projectId,
  itemId,
}: ItemDialogProps) {
  const emptyForm: ItemFormData = {
    code: '',
    name: '',
    materials: '',
    technicalNotes: '',
    comment: '',
    dueDate: '',
    components: [],
  };

  const [formData, setFormData] = useState<ItemFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [componentsState, setComponentsState] = useState<ComponentDraft[]>([]);
  const [isComponentsLoading, setIsComponentsLoading] = useState(false);

  const mapMaterialRecord = (material: any): MaterialDraft => ({
    id: material.id,
    name: material.name || '',
    materialType: (material.material_type as MaterialFormData['materialType']) || 'ldsp',
    thickness: material.thickness ?? undefined,
    quantity: material.quantity ?? 1,
    unit: (material.unit as MaterialFormData['unit']) || 'sheet',
    color: material.color || '',
    finish: (material.finish as MaterialFormData['finish']) || undefined,
    woodSpecies: material.wood_species || undefined,
    grade: (material.grade as MaterialFormData['grade']) || undefined,
    brand: material.brand || '',
    article: material.article || '',
    notes: material.notes || '',
    isNew: false,
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setComponentsState([]);
  };

  const loadExistingComponents = async (currentItemId: string) => {
    try {
      setIsComponentsLoading(true);
      const details = await productionManagementService.getItemDetails(currentItemId);
      const comps = details?.components || [];
      const mapped: ComponentDraft[] = [];
      for (const component of comps) {
        let materials: any[] = [];
        try {
          materials = await productionManagementService.getComponentMaterials(component.id);
        } catch (error) {
          console.error('Error loading component materials:', error);
        }
        mapped.push({
          id: component.id,
          name: component.name,
          quantity: component.quantity,
          unit: component.unit,
          material: component.material || undefined,
          templateId: undefined,
          materials: materials.map(mapMaterialRecord),
          isNew: false,
        });
      }
      setComponentsState(mapped);
    } catch (error) {
      console.error('Error loading components:', error);
      toast.error('Не удалось загрузить компоненты изделия');
    } finally {
      setIsComponentsLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        quantity: initialData.quantity,
        currentStage: initialData.currentStage,
        materials: initialData.materials || '',
        technicalNotes: initialData.technicalNotes || '',
        comment: initialData.comment || '',
        dueDate: initialData.dueDate || '',
      });
    } else {
      setFormData(emptyForm);
    }
  }, [initialData, open]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && itemId) {
      loadExistingComponents(itemId);
    } else {
      setComponentsState([]);
    }
  }, [open, mode, itemId]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      setIsSaving(true);
      const payload: ItemFormData = {
        ...formData,
        components: componentsState,
      };
      await onSave(payload);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          resetForm();
        }
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Добавить изделие' : 'Редактировать изделие'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <section className="rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">Основная информация</p>
              <p className="text-xs text-muted-foreground">
                Укажите базовые параметры изделия — код создаётся автоматически
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="item-code">Код изделия</Label>
                <Input
                  id="item-code"
                  value={formData.code}
                  readOnly
                  className="bg-muted/60 text-muted-foreground cursor-not-allowed"
                  placeholder="Генерируется автоматически"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-name">
                  Название <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Кухня нижние модули"
                  autoFocus
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-muted/10 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">Техничка</p>
              <p className="text-xs text-muted-foreground">
                Привяжите документ из ТЗ или загрузите новый файл
              </p>
            </div>
            {projectId ? (
              <TechnicalDocumentSelector
                projectId={projectId}
                value={formData.technicalNotes || ''}
                onChange={(value) => setFormData({ ...formData, technicalNotes: value })}
              />
            ) : (
              <Textarea
                id="item-technical"
                value={formData.technicalNotes || ''}
                onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
                placeholder="Ссылка на чертеж, особенности конструкции..."
                rows={3}
              />
            )}
          </section>

          <section className="rounded-2xl border border-border/60 bg-background p-4 sm:p-5 shadow-sm">
            <ItemComponentsEditor
              value={componentsState}
              onChange={setComponentsState}
              isLoading={isComponentsLoading}
            />
          </section>

          <section className="rounded-2xl border border-border/60 bg-muted/10 p-4 sm:p-5 space-y-4">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="item-comment">Комментарий</Label>
                <Textarea
                  id="item-comment"
                  value={formData.comment || ''}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Что важно учесть при производстве"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-due-date">Срок изделия</Label>
                <DatePicker
                  date={formData.dueDate ? new Date(formData.dueDate) : undefined}
                  onDateChange={(date) =>
                    setFormData({
                      ...formData,
                      dueDate: date ? date.toISOString().split('T')[0] : '',
                    })
                  }
                  placeholder="Выберите дату"
                />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isSaving}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name.trim() || isSaving}
            className="flex-1"
          >
            {isSaving ? 'Сохранение...' : mode === 'create' ? 'Добавить' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
