import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { toast } from '../../lib/toast';
import { Project } from '../../types';
import { mockClients, mockUsers } from '../../lib/mockData';

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdate: (updatedProject: Project) => void;
}

export function EditProjectDialog({ project, open, onOpenChange, onProjectUpdate }: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    budget: project.budget.toString(),
    dueDate: project.dueDate || '',
    priority: project.priority,
    clientId: project.clientId,
    managerId: project.managerId,
    foremanId: project.foremanId || '',
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
      
      if (!formData.clientId) {
        toast.error('Выберите клиента');
        return;
      }

      if (!formData.managerId) {
        toast.error('Выберите менеджера');
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
        priority: formData.priority as Project['priority'],
        clientId: formData.clientId,
        managerId: formData.managerId,
        foremanId: formData.foremanId || null,
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
      <DialogContent className="sm:max-w-[600px]" aria-describedby="edit-project-visible-description">
        <DialogHeader>
          <DialogTitle>Редактировать проект</DialogTitle>
          <DialogDescription id="edit-project-visible-description">
            Измените детали проекта. Поля отмеченные * обязательны для заполнения.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Название проекта *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Введите название проекта"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
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
              <Label htmlFor="client">Клиент *</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleInputChange('clientId', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="manager">Менеджер *</Label>
              <Select value={formData.managerId} onValueChange={(value) => handleInputChange('managerId', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.filter(user => user.role === 'Manager').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="foreman">Начальник цеха</Label>
              <Select value={formData.foremanId} onValueChange={(value) => handleInputChange('foremanId', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите начальника цеха" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Не назначен</SelectItem>
                  {mockUsers.filter(user => user.role === 'Master').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Приоритет</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Бюджет (₽)</Label>
              <Input
                id="budget"
                type="text"
                value={formData.budget}
                onChange={(e) => {
                  // Разрешаем только цифры
                  const value = e.target.value.replace(/[^0-9]/g, '');
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

            <div className="md:col-span-2">
              <Label htmlFor="siteAddress">Адрес объекта</Label>
              <Input
                id="siteAddress"
                value={formData.siteAddress}
                onChange={(e) => handleInputChange('siteAddress', e.target.value)}
                placeholder="Адрес строительной площадки"
                className="mt-1"
              />
            </div>
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