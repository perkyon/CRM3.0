import React from 'react';
import { Check, X, Bot, User, Zap, Shield, Users, MessageSquare, Phone, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function TelegramComparison() {
  const botFeatures = [
    { icon: Zap, text: 'Автоматизация ответов', good: true },
    { icon: Users, text: 'Масштабируемость (один бот для всех)', good: true },
    { icon: Shield, text: 'Безопасность (отдельный бот)', good: true },
    { icon: Settings, text: 'Простая настройка (1 токен)', good: true },
    { icon: MessageSquare, text: 'Интеграция с CRM через webhooks', good: true },
    { icon: X, text: 'Не может писать первым', good: false },
    { icon: X, text: 'Ограниченный функционал', good: false },
  ];

  const userFeatures = [
    { icon: User, text: 'Может писать первым', good: true },
    { icon: Phone, text: 'Полный доступ (звонки, видео)', good: true },
    { icon: Users, text: 'Работа в группах/каналах', good: true },
    { icon: MessageSquare, text: 'Доверие клиентов (видят человека)', good: true },
    { icon: X, text: 'Сложная настройка (MTProto)', good: false },
    { icon: X, text: 'Нужен отдельный сервер', good: false },
    { icon: X, text: 'Риск блокировки аккаунта', good: false },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Telegram: Бот vs Личный аккаунт</h1>
        <p className="mt-2 text-muted-foreground">
          Сравнение двух подходов для работы с клиентами через Telegram
        </p>
      </div>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList>
          <TabsTrigger value="comparison">Сравнение</TabsTrigger>
          <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
          <TabsTrigger value="hybrid">Гибридный подход</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bot API */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Bot className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Bot API (Бот)</CardTitle>
                    <CardDescription>Официальный API для ботов</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {botFeatures.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 rounded-lg p-3 ${
                          feature.good
                            ? 'bg-green-50 dark:bg-green-950/20'
                            : 'bg-red-50 dark:bg-red-950/20'
                        }`}
                      >
                        {feature.good ? (
                          <Check className="size-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="size-5 text-red-600 dark:text-red-400" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {typeof Icon !== 'string' && <Icon className="size-4" />}
                            <span className="text-sm font-medium">{feature.text}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">Когда использовать:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Автоматизация ответов клиентам</li>
                    <li>• Уведомления о статусе заказов</li>
                    <li>• Сбор заявок через команды</li>
                    <li>• Массовые рассылки</li>
                    <li>• Интеграция с CRM</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* User API */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <User className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>User API (Личный аккаунт)</CardTitle>
                    <CardDescription>MTProto для личных аккаунтов</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {userFeatures.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 rounded-lg p-3 ${
                          feature.good
                            ? 'bg-green-50 dark:bg-green-950/20'
                            : 'bg-red-50 dark:bg-red-950/20'
                        }`}
                      >
                        {feature.good ? (
                          <Check className="size-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="size-5 text-red-600 dark:text-red-400" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {typeof Icon !== 'string' && <Icon className="size-4" />}
                            <span className="text-sm font-medium">{feature.text}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">Когда использовать:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Личная переписка с VIP-клиентами</li>
                    <li>• Когда нужно писать первым</li>
                    <li>• Работа в группах/каналах</li>
                    <li>• Когда важна персональность</li>
                    <li>• Нужны звонки/видео</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Сравнительная таблица */}
          <Card>
            <CardHeader>
              <CardTitle>Детальное сравнение</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left font-semibold">Критерий</th>
                      <th className="p-3 text-center font-semibold">Bot API</th>
                      <th className="p-3 text-center font-semibold">User API</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { criterion: 'Настройка', bot: '⭐⭐⭐⭐⭐ Очень просто', user: '⭐⭐ Сложно' },
                      { criterion: 'Может писать первым', bot: '❌ Нет', user: '✅ Да' },
                      { criterion: 'Автоматизация', bot: '✅ Отлично', user: '⚠️ Ограничено' },
                      { criterion: 'Масштабируемость', bot: '✅ Один бот для всех', user: '⚠️ Один аккаунт' },
                      { criterion: 'Безопасность', bot: '✅ Безопасно', user: '⚠️ Риск блокировки' },
                      { criterion: 'Интеграция с CRM', bot: '✅ Легко', user: '⚠️ Сложнее' },
                      { criterion: 'Доверие клиентов', bot: '⚠️ Видят бота', user: '✅ Видят человека' },
                      { criterion: 'Группы/каналы', bot: '⚠️ Ограниченный доступ', user: '✅ Полный доступ' },
                      { criterion: 'Звонки/видео', bot: '❌ Нет', user: '✅ Да' },
                      { criterion: 'Стоимость', bot: '✅ Бесплатно', user: '⚠️ Нужен сервер' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3 font-medium">{row.criterion}</td>
                        <td className="p-3 text-center text-sm">{row.bot}</td>
                        <td className="p-3 text-center text-sm">{row.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Используй БОТА, если:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Нужна автоматизация ответов</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Много клиентов (масштабируемость)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Важна интеграция с CRM</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Нужны уведомления о статусе заказов</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Хочешь собирать заявки через команды</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Нужна история всех сообщений в БД</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Используй ЛИЧНЫЙ АККАУНТ, если:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Работаешь с VIP-клиентами лично</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Нужно писать первым</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Важна персональность общения</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Работаешь в группах/каналах</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Нужны звонки/видео</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <span>Небольшое количество клиентов</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hybrid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>💡 Гибридный подход (лучший вариант)</CardTitle>
              <CardDescription>Используй оба варианта для максимальной эффективности</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
                  <div className="mb-3 flex items-center gap-2">
                    <Bot className="size-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold">Бот — для автоматизации</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>• Автоматические ответы</li>
                    <li>• Уведомления о статусе</li>
                    <li>• Сбор заявок</li>
                    <li>• Массовые рассылки</li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-purple-50 p-4 dark:bg-purple-950/20">
                  <div className="mb-3 flex items-center gap-2">
                    <User className="size-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold">Личный аккаунт — для персонального общения</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li>• VIP-клиенты</li>
                    <li>• Сложные вопросы</li>
                    <li>• Когда нужен человеческий подход</li>
                    <li>• Работа в группах</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border bg-amber-50 p-4 dark:bg-amber-950/20">
                <h4 className="mb-3 font-semibold">Примеры использования:</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <Badge variant="outline" className="mb-2">Интернет-магазин</Badge>
                    <p className="text-muted-foreground">
                      Бот: автоматические ответы, уведомления о заказах. Личный аккаунт: решение
                      проблем, работа с возвратами.
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Услуги (мебельная мастерская)</Badge>
                    <p className="text-muted-foreground">
                      Бот: сбор заявок, уведомления о готовности. Личный аккаунт: обсуждение
                      дизайна, консультации.
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">B2B продажи</Badge>
                    <p className="text-muted-foreground">
                      Бот: первичный контакт, сбор информации. Личный аккаунт: переговоры, закрытие
                      сделок.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


