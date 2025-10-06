import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DatePicker } from '../ui/date-picker';
import { toast } from '../../lib/toast';
import { Project } from '../../types';

interface SimpleEditDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdate: (updatedProject: Project) => void;
}

export function SimpleEditDialog({ project, open, onOpenChange, onProjectUpdate }: SimpleEditDialogProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    budget: project.budget.toString(),
    dueDate: project.dueDate || '',
    siteAddress: project.siteAddress || ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Валидация
      if (!formData.title.trim()) {
        toast.error('Название проекта обязательно');
        return;
      }

      // Симуляция сохранения
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedProject: Project = {
        ...project,
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: parseFloat(formData.budget) || 0,
        dueDate: formData.dueDate || null,
        siteAddress: formData.siteAddress.trim()
      };

      onProjectUpdate(updatedProject);
      onOpenChange(false);
      toast.success('Проект успешно обновлен');
    } catch (error) {
      toast.error('Ошибка при сохранении проекта');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="simple-edit-visible-description">
        <DialogHeader>
          <DialogTitle>Редактировать проект</DialogTitle>
          <DialogDescription id="simple-edit-visible-description">
            Измените данные проекта и нажмите сохранить для применения изменений.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название проекта *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Введите название проекта"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Описание проекта"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="budget">Бюджет (₽)</Label>
            <Input
              id="budget"
              type="text"
              value={formData.budget}
              onChange={(e) => {
                // Разрешаем только цифры
                const value = (e.target.value || '').replace(/[^0-9]/g, '');
                handleInputChange('budget', value);
              }}
              placeholder="350002"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Срок сдачи</Label>
            <DatePicker
              date={formData.dueDate ? new Date(formData.dueDate) : undefined}
              onDateChange={(date) => {
                handleInputChange('dueDate', date ? date.toISOString().split('T')[0] : '');
              }}
              placeholder="Выберите дату"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="siteAddress">Адрес объекта</Label>
            <Input
              id="siteAddress"
              value={formData.siteAddress}
              onChange={(e) => handleInputChange('siteAddress', e.target.value)}
              placeholder="Адрес строительной площадки"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}