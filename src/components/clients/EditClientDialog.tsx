import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  X, 
  Save,
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Calendar,
  Activity,
  FileText,
  Tag,
  Plus,
  Trash2
} from 'lucide-react';
import { Client, ClientTag } from '../../types';
import { formatPhone, getInitials } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { useUsers } from '../../lib/hooks/useUsers';

interface EditClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientUpdate: (client: Client) => void;
}

const typeLabels = {
  'Физ. лицо': 'Физическое лицо',
  'ИП': 'Индивидуальный предприниматель',
  'ООО': 'Общество с ограниченной ответственностью'
};

const statusLabels = {
  lead: 'Лид',
  new: 'Новый',
  client: 'Клиент',
  in_work: 'В работе',
  lost: 'Потерян'
};

const channelLabels = {
  'WhatsApp': 'WhatsApp',
  'Telegram': 'Telegram',
  'Email': 'Email',
  'Phone': 'Телефон'
};

export function EditClientDialog({ client, open, onOpenChange, onClientUpdate }: EditClientDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { getManagersAndAdmins } = useUsers();
  
  // Состояние формы
  const [formData, setFormData] = useState({
    type: 'Физ. лицо' as 'Физ. лицо' | 'ИП' | 'ООО',
    name: '',
    company: '',
    status: 'new' as 'lead' | 'new' | 'in_work' | 'lost' | 'client',
    source: '',
    ownerId: '',
    preferredChannel: 'Phone' as 'WhatsApp' | 'Telegram' | 'Email' | 'Phone',
    notes: '',
    // Контактное лицо
    contactName: '',
    contactRole: '',
    contactPhone: '',
    contactEmail: '',
    // Адреса
    physicalStreet: '',
    physicalCity: '',
    physicalZipCode: '',
    billingStreet: '',
    billingCity: '',
    billingZipCode: '',
    // Мессенджеры
    whatsapp: '',
    telegram: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Инициализация формы при открытии
  useEffect(() => {
    if (client && open) {
      const primaryContact = client.contacts.find(c => c.isPrimary) || client.contacts[0];
      
      setFormData({
        type: client.type,
        name: client.name,
        company: client.company || '',
        status: client.status,
        source: client.source,
        ownerId: client.ownerId,
        preferredChannel: client.preferredChannel,
        notes: client.notes || '',
        contactName: primaryContact?.name || '',
        contactRole: primaryContact?.role || '',
        contactPhone: primaryContact?.phone || '',
        contactEmail: primaryContact?.email || '',
        physicalStreet: client.addresses.physical?.street || '',
        physicalCity: client.addresses.physical?.city || '',
        physicalZipCode: client.addresses.physical?.zipCode || '',
        billingStreet: client.addresses.billing?.street || '',
        billingCity: client.addresses.billing?.city || '',
        billingZipCode: client.addresses.billing?.zipCode || '',
        whatsapp: primaryContact?.messengers?.whatsapp || '',
        telegram: primaryContact?.messengers?.telegram ? primaryContact.messengers.telegram.replace('@', '') : ''
      });
    }
  }, [client, open]);

  // Маска для телефона
  const formatPhoneInput = (value: string) => {
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
    const formatted = formatPhoneInput(e.target.value);
    setFormData(prev => ({ ...prev, contactPhone: formatted }));
  };

  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value || '';
    // Убираем все @ символы
    value = value.replace(/@/g, '');
    // Убираем пробелы и спецсимволы кроме подчеркивания
    value = value.replace(/[^a-zA-Z0-9_]/g, '');
    setFormData(prev => ({ ...prev, telegram: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название/ФИО обязательно для заполнения';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Телефон обязателен для заполнения';
    } else {
      const phoneDigits = (formData.contactPhone || '').replace(/\D/g, '');
      if (phoneDigits.length < 11) {
        newErrors.contactPhone = 'Введите корректный номер телефона';
      }
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Введите корректный email';
    }

    if (!formData.ownerId) {
      newErrors.ownerId = 'Выберите ответственного';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔵 handleSubmit called');
    e.preventDefault();
    
    const isValid = validateForm();
    console.log('📝 Form validation:', { isValid, hasClient: !!client });
    
    if (!isValid || !client) {
      console.log('❌ Form validation failed or no client');
      return;
    }

    console.log('✅ Starting save...');
    setLoading(true);
    
    try {
      // Создаем обновленный объект клиента
      const updatedClient: Client = {
        ...client,
        type: formData.type,
        name: formData.name,
        company: formData.type !== 'Физ. лицо' ? formData.name : formData.company,
        status: formData.status,
        source: formData.source,
        ownerId: formData.ownerId,
        preferredChannel: formData.preferredChannel,
        notes: formData.notes,
        contacts: [{
          id: client.contacts[0]?.id || '9fc4d042-f598-487c-a383-cccfe0e219db',
          name: formData.contactName || formData.name,
          role: formData.contactRole || (formData.type === 'Физ. лицо' ? 'Владелец' : 'Представитель'),
          phone: formData.contactPhone,
          email: formData.contactEmail,
          isPrimary: true,
          messengers: {
            whatsapp: formData.whatsapp || undefined,
            telegram: formData.telegram ? `@${formData.telegram}` : undefined
          }
        }],
        addresses: {
          physical: formData.physicalStreet ? {
            street: formData.physicalStreet,
            city: formData.physicalCity,
            zipCode: formData.physicalZipCode
          } : undefined,
          billing: formData.billingStreet ? {
            street: formData.billingStreet,
            city: formData.billingCity,
            zipCode: formData.billingZipCode
          } : undefined
        }
      };
      
      console.log('📤 Sending client data:', JSON.stringify(updatedClient, null, 2));
      onClientUpdate(updatedClient);
      
      toast('Данные клиента успешно обновлены', { type: 'success' });
      
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error updating client:', error);
      toast('Ошибка при обновлении данных клиента', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onOpenChange(false);
  };

  const copyPhysicalToBilling = () => {
    setFormData(prev => ({
      ...prev,
      billingStreet: prev.physicalStreet,
      billingCity: prev.physicalCity,
      billingZipCode: prev.physicalZipCode
    }));
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[96vw] sm:max-w-[96vw] w-full h-[96vh] flex flex-col p-0 gap-0"
        aria-describedby="edit-client-dialog-description"
      >
        <DialogDescription id="edit-client-dialog-description" className="sr-only">
          Форма редактирования информации о клиенте
        </DialogDescription>
        
        {/* Заголовок */}
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="size-10 shrink-0">
                <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-medium truncate">{client.name}</div>
                <div className="text-sm text-muted-foreground">
                  Редактирование клиента
                </div>
              </div>
            </DialogTitle>
            
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                <X className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Отмена</span>
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmit} 
                disabled={loading}
              >
                <Save className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">{loading ? 'Сохранение...' : 'Сохранить'}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 sm:px-6 pt-4 shrink-0">
              <TabsList className="!grid w-full grid-cols-3">
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="contacts">Контакты</TabsTrigger>
                <TabsTrigger value="addresses">Адреса</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
              {/* Основная информация */}
              <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="size-5" />
                      Основная информация
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                      {/* Статус */}
                      <div>
                        <Label htmlFor="status">Статус</Label>
                        <Select value={formData.status} onValueChange={(value: 'lead' | 'new' | 'client' | 'in_work' | 'lost') => 
                          setFormData(prev => ({ ...prev, status: value }))
                        }>
                          <SelectTrigger id="status" className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      {/* Компания (для Физ. лица) */}
                      {formData.type === 'Физ. лицо' && (
                        <div>
                          <Label htmlFor="company">Компания</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="Место работы (опционально)"
                            className="mt-1"
                          />
                        </div>
                      )}
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
                            {getManagersAndAdmins.map(user => (
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
                          {Object.entries(channelLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
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
              </TabsContent>

              {/* Контакты */}
              <TabsContent value="contacts" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="size-5" />
                      Контактная информация
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Имя контакта */}
                      <div>
                        <Label htmlFor="contactName">Контактное лицо</Label>
                        <Input
                          id="contactName"
                          value={formData.contactName}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                          placeholder="ФИО контактного лица"
                          className="mt-1"
                        />
                      </div>

                      {/* Роль */}
                      <div>
                        <Label htmlFor="contactRole">Должность</Label>
                        <Input
                          id="contactRole"
                          value={formData.contactRole}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactRole: e.target.value }))}
                          placeholder="Должность контактного лица"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Телефон */}
                      <div>
                        <Label htmlFor="contactPhone">Телефон <span className="text-destructive">*</span></Label>
                        <Input
                          id="contactPhone"
                          value={formData.contactPhone}
                          onChange={handlePhoneChange}
                          placeholder="+7 (___) ___-__-__"
                          className={`mt-1 ${errors.contactPhone ? 'border-destructive' : ''}`}
                        />
                        {errors.contactPhone && (
                          <p className="text-destructive text-sm mt-1">{errors.contactPhone}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="email@example.com"
                          className={`mt-1 ${errors.contactEmail ? 'border-destructive' : ''}`}
                        />
                        {errors.contactEmail && (
                          <p className="text-destructive text-sm mt-1">{errors.contactEmail}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium">Мессенджеры</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {/* WhatsApp */}
                        <div>
                          <Label htmlFor="whatsapp">WhatsApp</Label>
                          <Input
                            id="whatsapp"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                            placeholder="+7 (___) ___-__-__"
                            className="mt-1"
                          />
                        </div>

                        {/* Telegram */}
                        <div>
                          <Label htmlFor="telegram">Telegram</Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">@</span>
                            <Input
                              id="telegram"
                              value={formData.telegram}
                              onChange={handleTelegramChange}
                              placeholder="username"
                              className="pl-8"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Адреса */}
              <TabsContent value="addresses" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6 m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="size-5" />
                      Адреса
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Физический адрес */}
                    <div>
                      <Label className="font-medium">Физический адрес</Label>
                      <div className="space-y-3 mt-3">
                        <div>
                          <Label htmlFor="physicalStreet">Улица, дом</Label>
                          <Input
                            id="physicalStreet"
                            value={formData.physicalStreet}
                            onChange={(e) => setFormData(prev => ({ ...prev, physicalStreet: e.target.value }))}
                            placeholder="ул. Примерная, д. 1, кв. 1"
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="physicalCity">Город</Label>
                            <Input
                              id="physicalCity"
                              value={formData.physicalCity}
                              onChange={(e) => setFormData(prev => ({ ...prev, physicalCity: e.target.value }))}
                              placeholder="Москва"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="physicalZipCode">Индекс</Label>
                            <Input
                              id="physicalZipCode"
                              value={formData.physicalZipCode}
                              onChange={(e) => setFormData(prev => ({ ...prev, physicalZipCode: e.target.value }))}
                              placeholder="123456"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Юридический адрес */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Юридический адрес</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyPhysicalToBilling}
                          className="text-xs"
                        >
                          Скопировать из физического
                        </Button>
                      </div>
                      <div className="space-y-3 mt-3">
                        <div>
                          <Label htmlFor="billingStreet">Улица, дом</Label>
                          <Input
                            id="billingStreet"
                            value={formData.billingStreet}
                            onChange={(e) => setFormData(prev => ({ ...prev, billingStreet: e.target.value }))}
                            placeholder="ул. Примерная, д. 1, кв. 1"
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingCity">Город</Label>
                            <Input
                              id="billingCity"
                              value={formData.billingCity}
                              onChange={(e) => setFormData(prev => ({ ...prev, billingCity: e.target.value }))}
                              placeholder="Москва"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingZipCode">Индекс</Label>
                            <Input
                              id="billingZipCode"
                              value={formData.billingZipCode}
                              onChange={(e) => setFormData(prev => ({ ...prev, billingZipCode: e.target.value }))}
                              placeholder="123456"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}