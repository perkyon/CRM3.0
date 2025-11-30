import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (itemData: ItemFormData) => Promise<void>;
  initialData?: ItemFormData;
  mode: 'create' | 'edit';
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
}

export function ItemDialog({ open, onOpenChange, onSave, initialData, mode }: ItemDialogProps) {
  const emptyForm: ItemFormData = {
    code: '',
    name: '',
    materials: '',
    technicalNotes: '',
    comment: '',
    dueDate: '',
  };

  const [formData, setFormData] = useState<ItemFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    try {
      setIsSaving(true);
      await onSave(formData);
      onOpenChange(false);
      setFormData(emptyForm);
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Добавить изделие' : 'Редактировать изделие'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="item-code">
              Код изделия <span className="text-destructive">*</span>
            </Label>
            <Input
              id="item-code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="КУХ-НИЗ-001"
              autoFocus
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
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="item-materials">Материалы</Label>
            <Textarea
              id="item-materials"
              value={formData.materials || ''}
              onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
              placeholder="Например: МДФ, эмаль, фурнитура Blum..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="item-technical">
              Техничка
            </Label>
            <Textarea
              id="item-technical"
              value={formData.technicalNotes || ''}
              onChange={(e) => setFormData({ ...formData, technicalNotes: e.target.value })}
              placeholder="Ссылка на чертеж, особенности конструкции..."
              rows={3}
            />
          </div>

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
            <Input
              id="item-due-date"
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFormData(emptyForm);
            }}
            disabled={isSaving}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.code.trim() || !formData.name.trim() || isSaving}
            className="flex-1"
          >
            {isSaving ? 'Сохранение...' : mode === 'create' ? 'Добавить' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



