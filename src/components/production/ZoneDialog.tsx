import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => Promise<void>;
  initialName?: string;
  mode: 'create' | 'edit';
}

export function ZoneDialog({ open, onOpenChange, onSave, initialName = '', mode }: ZoneDialogProps) {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(initialName);
  }, [initialName, open]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      await onSave(name.trim());
      onOpenChange(false);
      setName('');
    } catch (error) {
      console.error('Error saving zone:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Добавить зону' : 'Переименовать зону'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="zone-name">
              Название зоны
            </Label>
            <Input
              id="zone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Гостиная, Кухня, Спальня..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setName('');
            }}
            disabled={isSaving}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="flex-1"
          >
            {isSaving ? 'Сохранение...' : mode === 'create' ? 'Добавить' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

