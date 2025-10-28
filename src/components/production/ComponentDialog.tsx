import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (componentData: ComponentFormData) => Promise<void>;
  initialData?: ComponentFormData;
  mode: 'create' | 'edit';
}

export interface ComponentFormData {
  name: string;
  quantity: number;
  unit: string;
  material?: string;
  templateId?: string;
}

const UNITS = [
  { value: 'шт', label: 'шт' },
  { value: 'м²', label: 'м²' },
  { value: 'пог.м', label: 'пог.м' },
  { value: 'комплект', label: 'комплект' },
];

export function ComponentDialog({ open, onOpenChange, onSave, initialData, mode }: ComponentDialogProps) {
  const [formData, setFormData] = useState<ComponentFormData>({
    name: '',
    quantity: 1,
    unit: 'шт',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        quantity: 1,
        unit: 'шт',
      });
    }
  }, [initialData, open]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      setIsSaving(true);
      await onSave(formData);
      onOpenChange(false);
      setFormData({
        name: '',
        quantity: 1,
        unit: 'шт',
      });
    } catch (error) {
      console.error('Error saving component:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Добавить компонент' : 'Редактировать компонент'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="component-name">
              Название компонента <span className="text-destructive">*</span>
            </Label>
            <Input
              id="component-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Корпус, Фасады, Столешница"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="component-quantity">
                Количество
              </Label>
              <Input
                id="component-quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="component-unit">
                Единица
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger id="component-unit">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFormData({
                name: '',
                quantity: 1,
                unit: 'шт',
              });
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

