import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { 
  Users, 
  ShoppingCart, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../ui/utils';

export function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-widest font-medium">BURO CRM</div>
            <button 
              className="text-sm tracking-wide hover:opacity-60 transition-opacity"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-white pt-32 md:pt-48 pb-24 md:pb-32">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-8xl lg:text-9xl leading-none mb-12 font-bold">
              CRM система для мебельного производства
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-2xl leading-relaxed">
              Управляйте клиентами, заказами и производством в одной системе. Увеличьте продажи на 40% и сократите время на рутину в 3 раза.
            </p>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-4 border-2 border-black text-lg hover:bg-black hover:text-white transition-colors duration-300"
              onClick={() => navigate('/pricing')}
            >
              Попробовать бесплатно
            </Button>
            <div className="mt-32 text-sm text-gray-400 tracking-widest">
              ПРОКРУТИТЕ
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Service 1 */}
            <div className="p-12 md:p-16 lg:p-24 min-h-[500px] flex flex-col justify-between border border-gray-200 group cursor-pointer transition-all duration-500 bg-white text-black hover:bg-gray-50">
              <div>
                <div className="text-8xl md:text-9xl mb-8 transition-opacity duration-500 text-black opacity-10 group-hover:opacity-20 font-bold">
                  01
                </div>
                <div className="mb-6 inline-block p-4 border border-black">
                  <Users className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl mb-6 transition-transform duration-500 group-hover:translate-x-2 font-bold">
                  Управление клиентами
                </h2>
                <p className="text-lg md:text-xl leading-relaxed text-gray-600">
                  База клиентов с полной историей заказов, контактами и предпочтениями. CRM для долгосрочных отношений.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <span className="text-sm px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  CRM
                </span>
                <span className="text-sm px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  База клиентов
                </span>
                <span className="text-sm px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  История заказов
                </span>
              </div>
            </div>

            {/* Service 2 */}
            <div className="p-12 md:p-16 lg:p-24 min-h-[500px] flex flex-col justify-between border border-gray-200 group cursor-pointer transition-all duration-500 bg-black text-white hover:bg-gray-900">
              <div>
                <div className="text-8xl md:text-9xl mb-8 transition-opacity duration-500 text-white opacity-20 group-hover:opacity-30 font-bold">
                  02
                </div>
                <div className="mb-6 inline-block p-4 border border-white">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl mb-6 transition-transform duration-500 group-hover:translate-x-2 font-bold">
                  Контроль заказов
                </h2>
                <p className="text-lg md:text-xl leading-relaxed text-gray-300">
                  Отслеживайте каждый заказ от замера до установки. Все этапы под контролем в одном интерфейсе.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <span className="text-sm px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                  Заказы
                </span>
                <span className="text-sm px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                  Статусы
                </span>
                <span className="text-sm px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                  Отслеживание
                </span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="p-12 md:p-16 lg:p-24 min-h-[500px] flex flex-col justify-between border border-gray-200 group cursor-pointer transition-all duration-500 bg-white text-black hover:bg-gray-50">
              <div>
                <div className="text-8xl md:text-9xl mb-8 transition-opacity duration-500 text-black opacity-10 group-hover:opacity-20 font-bold">
                  03
                </div>
                <div className="mb-6 inline-block p-4 border border-black">
                  <Calendar className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl mb-6 transition-transform duration-500 group-hover:translate-x-2 font-bold">
                  Производственный календарь
                </h2>
                <p className="text-lg md:text-xl leading-relaxed text-gray-600">
                  Планируйте загрузку цеха, распределяйте задачи между работниками и контролируйте сроки.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <span className="text-sm px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  Планирование
                </span>
                <span className="text-sm px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  Календарь
                </span>
                <span className="text-sm px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  Задачи
                </span>
              </div>
            </div>

            {/* Service 4 */}
            <div className="p-12 md:p-16 lg:p-24 min-h-[500px] flex flex-col justify-between border border-gray-200 group cursor-pointer transition-all duration-500 bg-black text-white hover:bg-gray-900">
              <div>
                <div className="text-8xl md:text-9xl mb-8 transition-opacity duration-500 text-white opacity-20 group-hover:opacity-30 font-bold">
                  04
                </div>
                <div className="mb-6 inline-block p-4 border border-white">
                  <DollarSign className="w-8 h-8" />
                </div>
                <h2 className="text-3xl md:text-4xl mb-6 transition-transform duration-500 group-hover:translate-x-2 font-bold">
                  Финансовый учет
                </h2>
                <p className="text-lg md:text-xl leading-relaxed text-gray-300">
                  Отслеживайте платежи, авансы и долги. Формируйте отчеты о прибыли и убытках.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <span className="text-sm px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                  Финансы
                </span>
                <span className="text-sm px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                  Платежи
                </span>
                <span className="text-sm px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300">
                  Отчеты
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">Преимущества</h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Реальные результаты, которые получают наши клиенты
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Results */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="mb-6">
                  <TrendingUp className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-4">РЕЗУЛЬТАТЫ</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Рост продаж</div>
                    <div className="text-2xl font-bold">40%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Экономия времени</div>
                    <div className="text-2xl font-bold">3x</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Удовлетворенность клиентов</div>
                    <div className="text-2xl font-bold">95%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Снижение ошибок</div>
                    <div className="text-2xl font-bold">60%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Automation */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="mb-6">
                  <Zap className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-4">АВТОМАТИЗАЦИЯ</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Уведомления клиентам</div>
                    <div className="text-2xl font-bold">100%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Напоминания о платежах</div>
                    <div className="text-2xl font-bold">Авто</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Контроль сроков</div>
                    <div className="text-2xl font-bold">24/7</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Формирование отчетов</div>
                    <div className="text-2xl font-bold">Авто</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="mb-6">
                  <BarChart3 className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-4">АНАЛИТИКА</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Динамика продаж</div>
                    <div className="text-2xl font-bold">Реал-тайм</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Загрузка производства</div>
                    <div className="text-2xl font-bold">Визуально</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Финансовые показатели</div>
                    <div className="text-2xl font-bold">Детально</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Эффективность менеджеров</div>
                    <div className="text-2xl font-bold">KPI</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="mb-6">
                  <Shield className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-4">БЕЗОПАСНОСТЬ</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Резервное копирование</div>
                    <div className="text-2xl font-bold">Ежедневно</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Защита данных SSL</div>
                    <div className="text-2xl font-bold">256bit</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Разграничение доступа</div>
                    <div className="text-2xl font-bold">Роли</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">SLA Uptime</div>
                    <div className="text-2xl font-bold">99.9%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">100+</div>
              <div className="text-gray-600">Мебельных компаний используют систему</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-gray-600">Заказов обрабатывается ежемесячно</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-gray-600">Поддержка на русском языке</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Демо-версия</h2>
          <p className="text-xl text-gray-600 mb-8">
            Посмотрите, как работает система изнутри
          </p>
          <Button 
            size="lg"
            variant="outline"
            className="px-8 py-4 border-2 border-black text-lg hover:bg-black hover:text-white transition-colors duration-300"
            onClick={() => navigate('/pricing')}
          >
            Открыть демо
          </Button>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">Тарифы</h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Прозрачное ценообразование без скрытых платежей. Первые 3 месяца бесплатно.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan 1: Старт */}
            <Card className="border-2 hover:border-black transition-colors cursor-pointer">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Старт</h3>
                <p className="text-gray-600 mb-6">Для небольших мастерских</p>
                <div className="text-4xl font-bold mb-8">2 990₽/мес</div>
                <Button 
                  className="w-full mb-8 border-2 border-black hover:bg-black hover:text-white"
                  variant="outline"
                  onClick={() => navigate('/pricing')}
                >
                  Выбрать план →
                </Button>
                <ul className="space-y-4">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>До 3 пользователей</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>До 50 заказов в месяц</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Управление клиентами</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Каталог продукции</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Базовая аналитика</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Email поддержка</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Plan 2: Бизнес (Популярный) */}
            <Card className="border-2 border-black relative hover:shadow-lg transition-shadow cursor-pointer">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-sm">
                Популярный
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Бизнес</h3>
                <p className="text-gray-600 mb-6">Для растущих компаний</p>
                <div className="text-4xl font-bold mb-8">5 990₽/мес</div>
                <Button 
                  className="w-full mb-8 bg-black text-white hover:bg-gray-900"
                  onClick={() => navigate('/pricing')}
                >
                  Выбрать план →
                </Button>
                <ul className="space-y-4">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>До 10 пользователей</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>До 200 заказов в месяц</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Все функции Старт</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Производственный календарь</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Финансовый учет</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Расширенная аналитика</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Интеграции с 1С</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Приоритетная поддержка</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Plan 3: Производство */}
            <Card className="border-2 hover:border-black transition-colors cursor-pointer">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Производство</h3>
                <p className="text-gray-600 mb-6">Для крупных предприятий</p>
                <div className="text-4xl font-bold mb-8">12 990₽/мес</div>
                <Button 
                  className="w-full mb-8 border-2 border-black hover:bg-black hover:text-white"
                  variant="outline"
                  onClick={() => navigate('/pricing')}
                >
                  Выбрать план →
                </Button>
                <ul className="space-y-4">
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Неограниченно пользователей</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Неограниченно заказов</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Все функции Бизнес</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Управление складом</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>API доступ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Персональный менеджер</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>Обучение команды</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span>SLA 99.9%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Контакты</h2>
              <p className="text-xl text-gray-600 mb-12">
                Готовы начать работу с Buro CRM? Свяжитесь с нами любым удобным способом.
              </p>
              <div className="space-y-8">
                <div>
                  <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">EMAIL</div>
                  <a href="mailto:support@furniturecrm.ru" className="text-lg hover:underline">
                    support@furniturecrm.ru
                  </a>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">ТЕЛЕФОН</div>
                  <a href="tel:+78001234567" className="text-lg hover:underline">
                    +7 (800) 123-45-67
                  </a>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">ГРАФИК РАБОТЫ</div>
                  <p className="text-lg">
                    Пн-Пт: 9:00 — 18:00<br />
                    Сб-Вс: Выходной
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="border-2">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide mb-2 block">ИМЯ</label>
                    <Input placeholder="Ваше имя" className="border-black" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide mb-2 block">КОМПАНИЯ</label>
                    <Input placeholder="Название компании" className="border-black" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide mb-2 block">EMAIL</label>
                    <Input type="email" placeholder="your@email.com" className="border-black" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide mb-2 block">ТЕЛЕФОН</label>
                    <Input type="tel" placeholder="+7 (999) 123-45-67" className="border-black" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 uppercase tracking-wide mb-2 block">СООБЩЕНИЕ</label>
                    <Input placeholder="Расскажите о вашей компании" className="border-black" />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-black text-white hover:bg-gray-900"
                  >
                    Отправить заявку
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm tracking-widest font-medium">BURO CRM</div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-black">
                Политика конфиденциальности
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black">
                Условия использования
              </a>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 Все права защищены
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
