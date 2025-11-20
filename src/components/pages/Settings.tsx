import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Database,
  Mail,
  Key,
  User,
  Building2,
  Save
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../lib/toast';

export function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Общие настройки
    organizationName: 'Buro Enterprise',
    language: 'ru',
    timezone: 'Europe/Moscow',
    dateFormat: 'DD.MM.YYYY',
    
    // Уведомления
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    clientUpdates: true,
    taskReminders: true,
    
    // Безопасность
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    
    // Интеграции
    emailIntegration: false,
    calendarSync: false,
  });

  const handleSave = () => {
    // TODO: Сохранить настройки в базу данных
    toast.success('Настройки сохранены');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium">Настройки</h1>
          <p className="text-muted-foreground">Управление настройками системы и профиля</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="size-4 mr-2" />
          Сохранить изменения
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <SettingsIcon className="size-4 mr-2" />
            Общие
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4 mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="size-4 mr-2" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Globe className="size-4 mr-2" />
            Интеграции
          </TabsTrigger>
        </TabsList>

        {/* Общие настройки */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Общие настройки</CardTitle>
              <CardDescription>
                Основные параметры системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="org-name">Название организации</Label>
                <Input
                  id="org-name"
                  value={settings.organizationName}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                  className="mt-1"
                />
              </div>

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
                  </SelectContent>
                </Select>
              </div>

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
                    Уведомления о приближающихся дедлайнах
                  </div>
                </div>
                <Switch
                  checked={settings.taskReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, taskReminders: checked })}
                />
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

              <div>
                <Label htmlFor="password-expiry">Срок действия пароля (дней)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) => setSettings({ ...settings, passwordExpiry: parseInt(e.target.value) || 90 })}
                  className="mt-1"
                  min={30}
                  max={365}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Через сколько дней требуется смена пароля
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Интеграции */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Интеграции</CardTitle>
              <CardDescription>
                Подключение внешних сервисов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label>Email интеграция</Label>
                    <div className="text-sm text-muted-foreground">
                      Синхронизация с почтовым ящиком
                    </div>
                  </div>
                </div>
                <Switch
                  checked={settings.emailIntegration}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailIntegration: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="size-5 text-muted-foreground" />
                  <div className="space-y-0.5">
                    <Label>Синхронизация календаря</Label>
                    <div className="text-sm text-muted-foreground">
                      Синхронизация с внешними календарями
                    </div>
                  </div>
                </div>
                <Switch
                  checked={settings.calendarSync}
                  onCheckedChange={(checked) => setSettings({ ...settings, calendarSync: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

