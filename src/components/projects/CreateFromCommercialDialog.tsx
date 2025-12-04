import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  User, 
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { useUserStore } from '../../lib/stores/userStore';
import { SmartClientSearch } from './SmartClientSearch';
import { CommercialDocument } from '../commercial/CommercialDocuments';

interface CreateFromCommercialDialogProps {
  commercialDocument: CommercialDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreate?: (project: any) => void;
}

export function CreateFromCommercialDialog({
  commercialDocument,
  open,
  onOpenChange,
  onProjectCreate
}: CreateFromCommercialDialogProps) {
  const { users, fetchUsers } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    siteAddress: '',
    managerId: '',
    foremanId: '',
    startDate: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Инициализация формы на основе коммерческого документа
  React.useEffect(() => {
    if (commercialDocument && open) {
      setFormData({
        title: commercialDocument.title,
        siteAddress: '',
        managerId: '',
        foremanId: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        priority: 'medium'
      });
    }
  }, [commercialDocument, open]);

  const handleCreateProject = async () => {
    if (!commercialDocument || !formData.title || !formData.managerId) {
      toast('Заполните обязательные поля', { type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Симуляция создания проекта
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newProject = {
        id: `PRJ-${Date.now()}`,
        title: formData.title,
        clientId: commercialDocument.clientId,
        siteAddress: formData.siteAddress,
        managerId: formData.managerId,
        foremanId: formData.foremanId || formData.managerId,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        budget: commercialDocument.amount,
        priority: formData.priority,
        stage: 'brief',
        briefComplete: false,
        createdAt: new Date().toISOString(),
        commercialDocumentId: commercialDocument.id,
        commercialDocumentType: commercialDocument.type
      };

      onProjectCreate?.(newProject);
      toast('Проект успешно создан из коммерческого документа!', { type: 'success' });
      onOpenChange(false);
    } catch (error) {
      toast('Ошибка при создании проекта', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!commercialDocument) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="create-project-from-commercial-description">
        <DialogHeader>
          <DialogTitle>Создать проект из коммерческого документа</DialogTitle>
          <DialogDescription id="create-project-from-commercial-description">
            Создание нового производственного проекта на основе одобренного коммерческого документа
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о коммерческом документе */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{commercialDocument.title}</div>
                <div className="text-sm text-muted-foreground">
                  {commercialDocument.number} • {commercialDocument.clientName}
                </div>
              </div>
              <Badge variant="default" className="ml-auto">
                {commercialDocument.type === 'quote' ? 'КП' : 'Договор'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 text-muted-foreground" />
                <span>{formatCurrency(commercialDocument.amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span>{commercialDocument.managerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span>{formatDate(commercialDocument.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Форма создания проекта */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Название проекта *</Label>
              <Input 
                id="project-title"
                placeholder="Введите название проекта" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-priority">Приоритет</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: typeof formData.priority) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
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

            <div className="col-span-2 space-y-2">
              <Label htmlFor="project-address">Адрес объекта</Label>
              <Input 
                id="project-address"
                placeholder="Введите адрес объекта" 
                value={formData.siteAddress}
                onChange={(e) => setFormData({...formData, siteAddress: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-manager">Менеджер проекта *</Label>
              <Select 
                value={formData.managerId} 
                onValueChange={(value) => setFormData({...formData, managerId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.role === 'Manager').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-foreman">Начальник цеха</Label>
              <Select 
                value={formData.foremanId} 
                onValueChange={(value) => setFormData({...formData, foremanId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите начальника цеха" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.role === 'Master').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-start">Дата старта</Label>
              <DatePicker
                date={formData.startDate ? new Date(formData.startDate) : undefined}
                onDateChange={(date) => {
                  setFormData({...formData, startDate: date ? date.toISOString().split('T')[0] : ''});
                }}
                placeholder="Выберите дату"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-due">Плановая дата завершения</Label>
              <DatePicker
                date={formData.dueDate ? new Date(formData.dueDate) : undefined}
                onDateChange={(date) => {
                  setFormData({...formData, dueDate: date ? date.toISOString().split('T')[0] : ''});
                }}
                placeholder="Выберите дату"
              />
            </div>
          </div>

          {/* Автоматически заполняемые поля */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="size-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Автоматически заполняется
              </span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div>• Клиент: {commercialDocument.clientName}</div>
              <div>• Бюджет: {formatCurrency(commercialDocument.amount)}</div>
              <div>• Связанный документ: {commercialDocument.number}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleCreateProject} 
              disabled={isLoading || !formData.title || !formData.managerId}
            >
              {isLoading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Создать проект
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}