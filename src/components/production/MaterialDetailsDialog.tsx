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
import { Loader2, Edit } from 'lucide-react';
import type { MaterialType, MaterialUnit, MaterialFinish, MaterialGrade } from './AddMaterialDialog';

interface MaterialDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: any;
  onSave?: (materialId: string, data: any) => Promise<void>;
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

export function MaterialDetailsDialog({ open, onOpenChange, material, onSave }: MaterialDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(material || {});

  useEffect(() => {
    if (material) {
      setFormData(material);
    }
    setIsEditing(false);
  }, [material, open]);

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
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold mb-1">{material.name}</DialogTitle>
              {!isEditing && (
                <p className="text-sm text-muted-foreground">Информация о материале</p>
              )}
            </div>
            {!isEditing && onSave && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="-mr-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {isEditing ? (
          // Edit mode
          <div className="px-6 py-4 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Название</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Производитель</Label>
                <Input
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="mt-1.5"
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
                />
              </div>
            )}

            {(showFinishField || showGradeField) && (
              <div className="grid grid-cols-2 gap-3">
                {showFinishField && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Обработка</Label>
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
                  </div>
                )}

                {showGradeField && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Сорт</Label>
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
                  />
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger className="w-20">
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
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Артикул</Label>
                <Input
                  value={formData.article || ''}
                  onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                  className="mt-1.5"
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
                />
              </div>
            )}
          </div>
        ) : (
          // View mode - Clean rows
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Количество</span>
              <span className="text-lg font-semibold">{material.quantity} {UNIT_NAMES[material.unit as MaterialUnit] || material.unit}</span>
            </div>

            {material.thickness && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Толщина</span>
                <span className="text-lg font-semibold">{material.thickness} мм</span>
              </div>
            )}

            {material.brand && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Производитель</span>
                <span className="text-lg">{material.brand}</span>
              </div>
            )}

            {material.wood_species && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Порода</span>
                <span className="text-lg">{material.wood_species}</span>
              </div>
            )}

            {material.finish && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Обработка</span>
                <span className="text-lg">{FINISH_NAMES[material.finish as MaterialFinish] || material.finish}</span>
              </div>
            )}

            {material.grade && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Класс</span>
                <span className="text-lg">{GRADE_NAMES[material.grade as MaterialGrade] || material.grade}</span>
              </div>
            )}

            {material.color && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Цвет</span>
                <span className="text-lg">{material.color}</span>
              </div>
            )}

            {material.article && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Артикул</span>
                <span className="text-lg font-mono">{material.article}</span>
              </div>
            )}

            {material.notes && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">Примечание</span>
                <span className="text-lg text-right">{material.notes}</span>
              </div>
            )}

            <Button 
              onClick={() => onOpenChange(false)} 
              className="w-full h-12 mt-8"
            >
              Закрыть
            </Button>
          </div>
        )}

        {isEditing && (
          <DialogFooter className="gap-2 px-6 py-4 border-t">
            <Button
              variant="ghost"
              onClick={() => {
                setFormData(material);
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

