import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { X } from 'lucide-react';
import { Client, User } from '../../types';
import { toast } from 'sonner';
import { mockUsers } from '../../lib/mockData';
import { supabase } from '../../lib/supabase/config';

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreate: (client: Omit<Client, 'id' | 'createdAt' | 'lastActivity' | 'projectsCount' | 'arBalance' | 'tags' | 'documents'>) => void;
}

export function NewClientDialog({ open, onOpenChange, onClientCreate }: NewClientDialogProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  
  // Форма
  const [formData, setFormData] = useState({
    type: 'Физ. лицо' as 'Физ. лицо' | 'ИП' | 'ООО',
    name: '',
    company: '',
    contactName: '',
    phone: '',
    email: '',
    source: '',
    ownerId: '',
    preferredChannel: 'Phone' as 'WhatsApp' | 'Telegram' | 'Email' | 'Phone',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Загружаем пользователей из Supabase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('active', true)
          .in('role', ['Manager', 'Admin']);

        if (error) {
          console.error('Error loading users:', error);
          // Fallback to mock users if Supabase fails
          setUsers(mockUsers.filter(user => user.role === 'Manager' || user.role === 'Admin'));
        } else {
          setUsers(data || []);
          // Автоматически выбираем первого пользователя (обычно это текущий пользователь)
          if (data && data.length > 0 && !formData.ownerId) {
            setFormData(prev => ({ ...prev, ownerId: data[0].id }));
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to mock users
        setUsers(mockUsers.filter(user => user.role === 'Manager' || user.role === 'Admin'));
      }
    };

    if (open) {
      loadUsers();
    }
  }, [open]);

  // Маска для телефона
  const formatPhone = (value: string) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('7')) {
      const match = digits.match(/^7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
      if (match) {
        let formatted = '+7';
        if (match[1]) formatted += ` (${match[1]}`;
        if (match[2]) formatted += `) ${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        if (match[4]) formatted += `-${match[4]}`;
        return formatted;
      }
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название/ФИО обязательно для заполнения';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else {
      const phoneDigits = (formData.phone || '').replace(/\D/g, '');
      if (phoneDigits.length < 11) {
        newErrors.phone = 'Введите корректный номер телефона';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.ownerId) {
      newErrors.ownerId = 'Выберите ответственного';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Создаем объект клиента
      const newClient: Omit<Client, 'id' | 'createdAt' | 'lastActivity' | 'projectsCount' | 'arBalance' | 'tags' | 'documents'> = {
        type: formData.type,
        name: formData.name,
        company: formData.type !== 'Физ. лицо' ? formData.name : undefined,
        contacts: [{
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: formData.contactName || formData.name,
          role: formData.type === 'Физ. лицо' ? 'Владелец' : 'Представитель',
          phone: formData.phone,
          email: formData.email,
          isPrimary: true,
          messengers: formData.phone ? {
            whatsapp: formData.phone ? formData.phone.replace(/\D/g, '').startsWith('7') ? formData.phone : undefined : undefined
          } : undefined
        }],
        addresses: {},
        preferredChannel: formData.preferredChannel,
        source: formData.source,
        status: 'lead',
        ownerId: formData.ownerId,
        notes: formData.notes
      };
      
      onClientCreate(newClient);
      
      toast('Клиент успешно создан', { type: 'success' });
      
      // Сброс формы
      setFormData({
        type: 'Физ. лицо',
        name: '',
        company: '',
        contactName: '',
        phone: '',
        email: '',
        source: '',
        ownerId: '',
        preferredChannel: 'Phone',
        notes: ''
      });
      
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating client:', error);
      toast('Ошибка при создании клиента', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: 'Физ. лицо',
      name: '',
      company: '',
      contactName: '',
      phone: '',
      email: '',
      source: '',
      ownerId: '',
      preferredChannel: 'Phone',
      notes: ''
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl w-full max-h-[90vh] flex flex-col gap-0 p-0"
        aria-describedby="new-client-dialog-description"
      >
        <DialogDescription id="new-client-dialog-description" className="sr-only">
          Форма создания нового клиента в системе
        </DialogDescription>
        
        {/* Заголовок */}
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-left">Новый клиент</DialogTitle>
          <p className="text-muted-foreground mt-1">
            Заполните основную информацию о клиенте для создания записи в системе.
          </p>
        </DialogHeader>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Основная информация */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Тип */}
                    <div>
                      <Label htmlFor="type">Тип <span className="text-destructive">*</span></Label>
                      <Select value={formData.type} onValueChange={(value: 'Физ. лицо' | 'ИП' | 'ООО') => 
                        setFormData(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger id="type" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Физ. лицо">Физ. лицо</SelectItem>
                          <SelectItem value="ИП">ИП</SelectItem>
                          <SelectItem value="ООО">ООО</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Название/ФИО */}
                    <div>
                      <Label htmlFor="name">
                        {formData.type === 'Физ. лицо' ? 'ФИО' : 'Название'} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={formData.type === 'Физ. лицо' ? 'Введите ФИО' : 'Введите название'}
                        className={`mt-1 ${errors.name ? 'border-destructive' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Телефон */}
                    <div>
                      <Label htmlFor="phone">Телефон <span className="text-destructive">*</span></Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="+7 (___) ___-__-__"
                        className={`mt-1 ${errors.phone ? 'border-destructive' : ''}`}
                      />
                      {errors.phone && (
                        <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        className={`mt-1 ${errors.email ? 'border-destructive' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-destructive text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Источник */}
                    <div>
                      <Label htmlFor="source">Источник</Label>
                      <Input
                        id="source"
                        value={formData.source}
                        onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                        placeholder="Откуда узнали о нас"
                        className="mt-1"
                      />
                    </div>

                    {/* Ответственный */}
                    <div>
                      <Label htmlFor="owner">Ответственный <span className="text-destructive">*</span></Label>
                      <Select value={formData.ownerId} onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, ownerId: value }))
                      }>
                        <SelectTrigger id="owner" className={`mt-1 ${errors.ownerId ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="Выберите ответственного" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.ownerId && (
                        <p className="text-destructive text-sm mt-1">{errors.ownerId}</p>
                      )}
                    </div>
                  </div>

                  {/* Предпочитаемый канал связи */}
                  <div>
                    <Label htmlFor="channel">Предпочитаемый канал связи</Label>
                    <Select value={formData.preferredChannel} onValueChange={(value: 'WhatsApp' | 'Telegram' | 'Email' | 'Phone') => 
                      setFormData(prev => ({ ...prev, preferredChannel: value }))
                    }>
                      <SelectTrigger id="channel" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Phone">Телефон</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Telegram">Telegram</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Примечания */}
                  <div>
                    <Label htmlFor="notes">Примечания</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Дополнительная информация о клиенте"
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Кнопки */}
          <div className="px-6 py-4 border-t border-border shrink-0">
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Отменить
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="min-w-[100px]"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}