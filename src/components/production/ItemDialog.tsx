import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
}

export function ItemDialog({ open, onOpenChange, onSave, initialData, mode }: ItemDialogProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    code: '',
    name: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        code: '',
        name: '',
      });
    }
  }, [initialData, open]);

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    try {
      setIsSaving(true);
      await onSave(formData);
      onOpenChange(false);
      setFormData({
        code: '',
        name: '',
      });
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
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFormData({
                code: '',
                name: '',
              });
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



