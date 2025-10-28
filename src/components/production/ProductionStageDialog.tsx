import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PRODUCTION_STAGES } from '../../lib/constants';

export interface ProductionStageFormData {
  name: string;
  customLabel?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'qa';
  assignee_id?: string;
  estimated_hours?: number;
  notes?: string;
}

interface ProductionStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProductionStageFormData) => void;
  stage?: ProductionStageFormData;
  users?: Array<{ id: string; name: string }>;
}

export function ProductionStageDialog({
  open,
  onOpenChange,
  onSave,
  stage,
  users = [],
}: ProductionStageDialogProps) {
  const [formData, setFormData] = useState<ProductionStageFormData>({
    name: 'cutting_cnc',
    status: 'pending',
    assignee_id: undefined,
    estimated_hours: undefined,
    notes: '',
  });

  const [isCustomStage, setIsCustomStage] = useState(false);

  useEffect(() => {
    if (stage) {
      setFormData(stage);
      // Check if this is a custom stage (not in predefined list)
      setIsCustomStage(!PRODUCTION_STAGES.some(s => s.value === stage.name));
    } else {
      setFormData({
        name: 'cutting_cnc',
        status: 'pending',
        assignee_id: undefined,
        estimated_hours: undefined,
        notes: '',
      });
      setIsCustomStage(false);
    }
  }, [stage, open]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{stage ? 'Редактировать этап' : 'Добавить этап'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Stage Type */}
          <div className="space-y-2">
            <Label>Тип этапа</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!isCustomStage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsCustomStage(false)}
                className="flex-1"
              >
                Из шаблона
              </Button>
              <Button
                type="button"
                variant={isCustomStage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsCustomStage(true)}
                className="flex-1"
              >
                Кастомный
              </Button>
            </div>
          </div>

          {/* Template or Custom Name */}
          {!isCustomStage ? (
            <div className="space-y-2">
              <Label>Шаблон этапа</Label>
              <Select
                value={formData.name}
                onValueChange={(value) => setFormData({ ...formData, name: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTION_STAGES.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      <span className="flex items-center gap-2">
                        <span>{stage.icon}</span>
                        <span>{stage.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Название этапа</Label>
              <Input
                value={formData.customLabel || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customLabel: e.target.value,
                    name: 'custom_' + e.target.value.toLowerCase().replace(/\s+/g, '_'),
                  })
                }
                placeholder="Например: Специальная обработка"
              />
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label>Статус</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span>Ожидает</span>
                  </span>
                </SelectItem>
                <SelectItem value="in_progress">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>В работе</span>
                  </span>
                </SelectItem>
                <SelectItem value="qa">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>На проверке</span>
                  </span>
                </SelectItem>
                <SelectItem value="completed">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Завершено</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          {users.length > 0 && (
            <div className="space-y-2">
              <Label>Исполнитель (опционально)</Label>
              <Select
                value={formData.assignee_id || 'none'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    assignee_id: value === 'none' ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Estimated Hours */}
          <div className="space-y-2">
            <Label>Плановое время (часы, опционально)</Label>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={formData.estimated_hours || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimated_hours: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder="Например: 2.5"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Примечание (опционально)</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

