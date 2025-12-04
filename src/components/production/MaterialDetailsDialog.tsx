import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';
import type { MaterialType, MaterialUnit, MaterialFinish, MaterialGrade } from './AddMaterialDialog';

interface MaterialDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: any;
  onSave?: (materialId: string, data: any) => Promise<void>;
  mode?: 'view' | 'edit';
}

const MATERIAL_TYPE_NAMES: Record<MaterialType, string> = {
  ldsp: 'ЛДСП',
  mdf: 'МДФ',
  plywood: 'Фанера',
  solid: 'Массив',
  veneer: 'Шпон',
  edge: 'Кромка',
  hardware: 'Фурнитура',
  paint: 'ЛКМ',
  other: 'Прочее',
};

const UNIT_NAMES: Record<MaterialUnit, string> = {
  sheet: 'Лист',
  sqm: 'м²',
  lm: 'п.м',
  piece: 'Шт',
  kg: 'Кг',
  liter: 'Л',
  set: 'Комплект',
};

const FINISH_NAMES: Record<MaterialFinish, string> = {
  raw: 'Без обработки',
  lacquer: 'Лак',
  stain: 'Инцес/Морилка',
  oil: 'Масло',
  wax: 'Воск',
  paint: 'Краска',
  laminate: 'Ламинат',
  veneer: 'Шпон',
};

const GRADE_NAMES: Record<MaterialGrade, string> = {
  grade_1_1: '1/1',
  grade_2_2: '2/2',
  grade_3_3: '3/3',
  grade_4_4: '4/4',
  grade_e: 'E (элита)',
  grade_b_bb: 'B/BB',
};

export function MaterialDetailsDialog({ open, onOpenChange, material, onSave, mode = 'view' }: MaterialDetailsDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(material || {});

  const isReadOnly = mode !== 'edit' || !onSave;

  useEffect(() => {
    if (material) {
      setFormData(material);
    }
  }, [material, open, mode]);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(material.id, formData);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!material) return null;

  const showFinishField = ['solid', 'veneer', 'plywood'].includes(formData.material_type);
  const showWoodSpeciesField = ['solid', 'veneer'].includes(formData.material_type);
  const showGradeField = formData.material_type === 'plywood';
  const showColorField = ['ldsp', 'mdf', 'edge'].includes(formData.material_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between pr-6">
            <div>
              <DialogTitle className="text-2xl font-bold mb-1">{material.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Информация о материале
              </p>
            </div>
            {mode === 'edit' && onSave && (
              <div className="text-xs uppercase tracking-wide text-muted-foreground pr-6">
                Редактирование
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Название</Label>
              <Input
                value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1.5"
              readOnly={isReadOnly}
            />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Производитель</Label>
                <Input
                  value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="mt-1.5"
                readOnly={isReadOnly}
              />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Толщина (мм)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.thickness || ''}
                onChange={(e) => setFormData({ ...formData, thickness: parseFloat(e.target.value) || undefined })}
                className="mt-1.5"
                readOnly={isReadOnly}
              />
              </div>
            </div>

            {showColorField && (
              <div>
                <Label className="text-xs text-muted-foreground">Цвет</Label>
                <Input
                  value={formData.color || ''}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="mt-1.5"
                readOnly={isReadOnly}
              />
              </div>
            )}

            {showWoodSpeciesField && (
              <div>
                <Label className="text-xs text-muted-foreground">Порода</Label>
                <Input
                  value={formData.wood_species || ''}
                onChange={(e) => setFormData({ ...formData, wood_species: e.target.value })}
                className="mt-1.5"
                readOnly={isReadOnly}
              />
              </div>
            )}

            {(showFinishField || showGradeField) && (
              <div className="grid grid-cols-2 gap-3">
                {showFinishField && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Обработка</Label>
                    {isReadOnly ? (
                      <div className="mt-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground/90">
                        {FINISH_NAMES[formData.finish as keyof typeof FINISH_NAMES] || '—'}
                      </div>
                    ) : (
                      <Select
                        value={formData.finish || 'raw'}
                        onValueChange={(value) => setFormData({ ...formData, finish: value })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(FINISH_NAMES).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {showGradeField && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Сорт</Label>
                    {isReadOnly ? (
                      <div className="mt-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground/90">
                        {GRADE_NAMES[formData.grade as keyof typeof GRADE_NAMES] || '—'}
                      </div>
                    ) : (
                      <Select
                        value={formData.grade || 'grade_2_2'}
                        onValueChange={(value) => setFormData({ ...formData, grade: value })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(GRADE_NAMES).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Количество</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="flex-1"
                  readOnly={isReadOnly}
                  />
                  {isReadOnly ? (
                    <div className="w-24 rounded-xl border border-border bg-muted px-3 py-2 text-sm text-center font-medium text-foreground/90">
                      {UNIT_NAMES[formData.unit as keyof typeof UNIT_NAMES] || formData.unit}
                    </div>
                  ) : (
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNIT_NAMES).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Артикул</Label>
                <Input
                  value={formData.article || ''}
                  onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                  className="mt-1.5"
                readOnly={isReadOnly}
                />
              </div>
            </div>

            {formData.notes !== undefined && (
              <div>
                <Label className="text-xs text-muted-foreground">Примечания</Label>
                <Textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="mt-1.5 resize-none"
                readOnly={isReadOnly}
                />
              </div>
            )}
        </div>

        <DialogFooter className="gap-2 px-6 py-4 border-t">
          {isReadOnly ? (
            <Button className="w-full h-11" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setFormData(material);
                  onOpenChange(false);
                }}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

