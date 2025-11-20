import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  User,
  Bell,
  Shield,
  Globe,
  Mail,
  Palette,
  Building2,
  Key,
  Download,
  Trash2,
  Camera,
  Save
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../lib/toast';
import { getInitials } from '../../lib/utils';

export function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Профиль
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || null,
    
    // Персонализация
    language: 'ru',
    theme: 'light',
    timezone: 'Europe/Moscow',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    weekStart: 'monday',
    
    // Email
    emailSignature: '',
    emailNotifications: true,
    
    // Уведомления
    pushNotifications: true,
    projectUpdates: true,
    clientUpdates: true,
    taskReminders: true,
    deadlineReminders: true,
    mentionNotifications: true,
    
    // Безопасность
    twoFactorAuth: false,
    sessionTimeout: 30,
    
    // Организация (только для админов)
    organizationName: 'Buro Enterprise',
    organizationPhone: '',
    organizationEmail: '',
    organizationAddress: '',
  });

  const isAdmin = user?.role === 'Admin';

  const handleSave = () => {
    // TODO: Сохранить настройки в базу данных
    toast.success('Настройки сохранены');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Загрузить аватар
      toast.success('Аватар обновлен');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium">Настройки</h1>
          <p className="text-muted-foreground">Управление профилем и настройками системы</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="size-4 mr-2" />
          Сохранить изменения
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="size-4 mr-2" />
            Профиль
          </TabsTrigger>
          <TabsTrigger value="personalization">
            <Palette className="size-4 mr-2" />
            Персонализация
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4 mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="size-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="size-4 mr-2" />
            Безопасность
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="organization">
              <Building2 className="size-4 mr-2" />
              Организация
            </TabsTrigger>
          )}
        </TabsList>

        {/* Профиль */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Профиль пользователя</CardTitle>
              <CardDescription>
                Личная информация и настройки профиля
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Аватар */}
              <div className="flex items-center gap-6">
                <Avatar className="size-20">
                  <AvatarImage src={settings.avatar || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(settings.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Camera className="size-4 mr-2" />
                        Изменить фото
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    Рекомендуемый размер: 200x200px, формат JPG или PNG
                  </p>
                </div>
              </div>

              {/* Личные данные */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Персонализация */}
        <TabsContent value="personalization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Персонализация</CardTitle>
              <CardDescription>
                Настройка внешнего вида и форматов отображения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language">Язык интерфейса</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({ ...settings, language: value })}
                >
                  <SelectTrigger id="language" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme">Тема оформления</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => setSettings({ ...settings, theme: value })}
                >
                  <SelectTrigger id="theme" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Светлая</SelectItem>
                    <SelectItem value="dark">Тёмная</SelectItem>
                    <SelectItem value="auto">Системная</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Часовой пояс</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                >
                  <SelectTrigger id="timezone" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                    <SelectItem value="Europe/Kiev">Киев (UTC+2)</SelectItem>
                    <SelectItem value="Asia/Almaty">Алматы (UTC+6)</SelectItem>
                    <SelectItem value="Asia/Tashkent">Ташкент (UTC+5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-format">Формат даты</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                  >
                    <SelectTrigger id="date-format" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time-format">Формат времени</Label>
                  <Select
                    value={settings.timeFormat}
                    onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}
                  >
                    <SelectTrigger id="time-format" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 часа</SelectItem>
                      <SelectItem value="12h">12 часов (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="week-start">Начало недели</Label>
                <Select
                  value={settings.weekStart}
                  onValueChange={(value) => setSettings({ ...settings, weekStart: value })}
                >
                  <SelectTrigger id="week-start" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Понедельник</SelectItem>
                    <SelectItem value="sunday">Воскресенье</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Уведомления */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>
                Настройка уведомлений и оповещений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Push уведомления</Label>
                  <div className="text-sm text-muted-foreground">
                    Получать push-уведомления в браузере
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Обновления проектов</Label>
                  <div className="text-sm text-muted-foreground">
                    Уведомления об изменениях в проектах
                  </div>
                </div>
                <Switch
                  checked={settings.projectUpdates}
                  onCheckedChange={(checked) => setSettings({ ...settings, projectUpdates: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Обновления клиентов</Label>
                  <div className="text-sm text-muted-foreground">
                    Уведомления об изменениях у клиентов
                  </div>
                </div>
                <Switch
                  checked={settings.clientUpdates}
                  onCheckedChange={(checked) => setSettings({ ...settings, clientUpdates: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Напоминания о задачах</Label>
                  <div className="text-sm text-muted-foreground">
                    Уведомления о новых и назначенных задачах
                  </div>
                </div>
                <Switch
                  checked={settings.taskReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, taskReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Напоминания о дедлайнах</Label>
                  <div className="text-sm text-muted-foreground">
                    Уведомления о приближающихся сроках
                  </div>
                </div>
                <Switch
                  checked={settings.deadlineReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, deadlineReminders: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Упоминания</Label>
                  <div className="text-sm text-muted-foreground">
                    Уведомления когда вас упоминают в комментариях
                  </div>
                </div>
                <Switch
                  checked={settings.mentionNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, mentionNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email настройки</CardTitle>
              <CardDescription>
                Настройка email-уведомлений и подписи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Email уведомления</Label>
                  <div className="text-sm text-muted-foreground">
                    Получать уведомления на email
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div>
                <Label htmlFor="email-signature">Email подпись</Label>
                <Textarea
                  id="email-signature"
                  value={settings.emailSignature}
                  onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
                  placeholder="С уважением,&#10;Иван Иванов&#10;Менеджер по продажам"
                  className="mt-1 min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Подпись будет автоматически добавляться к вашим email-сообщениям
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Безопасность */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Безопасность</CardTitle>
              <CardDescription>
                Настройки безопасности и доступа
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Двухфакторная аутентификация</Label>
                  <div className="text-sm text-muted-foreground">
                    Дополнительная защита аккаунта
                  </div>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                />
              </div>

              <div>
                <Label htmlFor="session-timeout">Таймаут сессии (минут)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
                  className="mt-1"
                  min={5}
                  max={1440}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Автоматический выход из системы после периода неактивности
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Key className="size-4 mr-2" />
                  Изменить пароль
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Организация (только для админов) */}
        {isAdmin && (
          <TabsContent value="organization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Настройки организации</CardTitle>
                <CardDescription>
                  Информация об организации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Название организации *</Label>
                  <Input
                    id="org-name"
                    value={settings.organizationName}
                    onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="org-phone">Телефон</Label>
                    <Input
                      id="org-phone"
                      type="tel"
                      value={settings.organizationPhone}
                      onChange={(e) => setSettings({ ...settings, organizationPhone: e.target.value })}
                      placeholder="+7 (999) 123-45-67"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="org-email">Email</Label>
                    <Input
                      id="org-email"
                      type="email"
                      value={settings.organizationEmail}
                      onChange={(e) => setSettings({ ...settings, organizationEmail: e.target.value })}
                      placeholder="info@company.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="org-address">Адрес</Label>
                  <Textarea
                    id="org-address"
                    value={settings.organizationAddress}
                    onChange={(e) => setSettings({ ...settings, organizationAddress: e.target.value })}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
