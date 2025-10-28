import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';

export type MaterialType = 'ldsp' | 'mdf' | 'plywood' | 'solid' | 'veneer' | 'edge' | 'hardware' | 'paint' | 'other';
export type MaterialUnit = 'sheet' | 'sqm' | 'lm' | 'piece' | 'kg' | 'liter' | 'set';
export type MaterialFinish = 'raw' | 'lacquer' | 'stain' | 'oil' | 'wax' | 'paint' | 'laminate' | 'veneer';
export type MaterialGrade = 'grade_1_1' | 'grade_2_2' | 'grade_3_3' | 'grade_4_4' | 'grade_e' | 'grade_b_bb';

export interface MaterialFormData {
  name: string;
  materialType: MaterialType;
  thickness?: number;
  quantity: number;
  unit: MaterialUnit;
  color?: string;
  finish?: MaterialFinish;
  woodSpecies?: string;
  grade?: MaterialGrade;
  brand?: string;
  article?: string;
  notes?: string;
}

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MaterialFormData) => Promise<void>;
  isLoading?: boolean;
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

export function AddMaterialDialog({ open, onOpenChange, onSave, isLoading }: AddMaterialDialogProps) {
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    materialType: 'ldsp',
    quantity: 1,
    unit: 'sheet',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        materialType: 'ldsp',
        quantity: 1,
        unit: 'sheet',
      });
    }
  }, [open]);

  const handleMaterialTypeChange = (type: MaterialType) => {
    // Автоматически меняем единицы измерения в зависимости от типа
    let defaultUnit: MaterialUnit = 'sheet';
    if (type === 'edge') defaultUnit = 'lm';
    else if (type === 'hardware') defaultUnit = 'piece';
    else if (type === 'paint') defaultUnit = 'liter';
    
    setFormData({ ...formData, materialType: type, unit: defaultUnit });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Название материала обязательно');
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      alert('Укажите корректное количество');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const showFinishField = ['solid', 'veneer', 'plywood'].includes(formData.materialType);
  const showWoodSpeciesField = ['solid', 'veneer'].includes(formData.materialType);
  const showGradeField = formData.materialType === 'plywood';
  const showColorField = ['ldsp', 'mdf', 'edge'].includes(formData.materialType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить материал</DialogTitle>
          <DialogDescription className="text-sm">
            Укажите характеристики материала
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-3">
          {/* Тип материала */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="materialType" className="text-right">
              Тип *
            </Label>
            <Select
              value={formData.materialType}
              onValueChange={(value) => handleMaterialTypeChange(value as MaterialType)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MATERIAL_TYPE_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Название */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Название *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: ЛДСП Egger U999"
              className="col-span-3"
            />
          </div>

          {/* Производитель */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Производитель
            </Label>
            <Input
              id="brand"
              value={formData.brand || ''}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Egger, Kronospan, Свеза..."
              className="col-span-3"
            />
          </div>

          {/* Толщина */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="thickness" className="text-right">
              Толщина (мм)
            </Label>
            <Input
              id="thickness"
              type="number"
              step="0.1"
              value={formData.thickness || ''}
              onChange={(e) => setFormData({ ...formData, thickness: parseFloat(e.target.value) || undefined })}
              placeholder="16, 18, 0.4..."
              className="col-span-3"
            />
          </div>

          {/* Цвет (для ЛДСП/МДФ/Кромки) */}
          {showColorField && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Цвет/Декор
              </Label>
              <Input
                id="color"
                value={formData.color || ''}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="U999 Черный, W1000 Белый..."
                className="col-span-3"
              />
            </div>
          )}

          {/* Порода дерева (для массива/шпона) */}
          {showWoodSpeciesField && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="woodSpecies" className="text-right">
                Порода
              </Label>
              <Input
                id="woodSpecies"
                value={formData.woodSpecies || ''}
                onChange={(e) => setFormData({ ...formData, woodSpecies: e.target.value })}
                placeholder="Дуб, Орех, Ясень, Бук..."
                className="col-span-3"
              />
            </div>
          )}

          {/* Обработка (для массива/шпона/фанеры) */}
          {showFinishField && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="finish" className="text-right">
                Обработка
              </Label>
              <Select
                value={formData.finish || 'raw'}
                onValueChange={(value) => setFormData({ ...formData, finish: value as MaterialFinish })}
              >
                <SelectTrigger className="col-span-3">
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

          {/* Сорт (для фанеры) */}
          {showGradeField && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Сорт
              </Label>
              <Select
                value={formData.grade || 'grade_2_2'}
                onValueChange={(value) => setFormData({ ...formData, grade: value as MaterialGrade })}
              >
                <SelectTrigger className="col-span-3">
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

          {/* Количество */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Количество *
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="flex-1"
              />
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value as MaterialUnit })}
              >
                <SelectTrigger className="w-[120px]">
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

          {/* Артикул */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="article" className="text-right">
              Артикул
            </Label>
            <Input
              id="article"
              value={formData.article || ''}
              onChange={(e) => setFormData({ ...formData, article: e.target.value })}
              placeholder="Код или артикул"
              className="col-span-3"
            />
          </div>

          {/* Примечания */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Примечания
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              className="col-span-3"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Отмена
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Добавить материал
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
