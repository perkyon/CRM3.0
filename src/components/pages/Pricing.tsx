import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, Zap, Building2, Rocket, Crown, ArrowRight } from 'lucide-react';
import { cn } from '../ui/utils';
import { SubscriptionPlan } from '../../types';

interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  limits: {
    users: number;
    projects: number;
    storage: number; // GB
  };
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Бесплатно',
    description: 'Для начала работы и тестирования',
    price: 0,
    period: 'month',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'До 3 пользователей',
      'До 5 проектов',
      '1 GB хранилища',
      'Базовые функции CRM',
      'Поддержка по email',
    ],
    limits: {
      users: 3,
      projects: 5,
      storage: 1,
    },
  },
  {
    id: 'starter',
    name: 'Стартовый',
    description: 'Для небольших мастерских',
    price: 990,
    period: 'month',
    popular: true,
    icon: <Building2 className="w-6 h-6" />,
    features: [
      'До 10 пользователей',
      'До 50 проектов',
      '10 GB хранилища',
      'Все функции CRM',
      'Приоритетная поддержка',
      'Экспорт данных',
      'API доступ',
    ],
    limits: {
      users: 10,
      projects: 50,
      storage: 10,
    },
  },
  {
    id: 'professional',
    name: 'Профессиональный',
    description: 'Для растущего бизнеса',
    price: 2990,
    period: 'month',
    icon: <Rocket className="w-6 h-6" />,
    features: [
      'До 50 пользователей',
      'Неограниченно проектов',
      '100 GB хранилища',
      'Все функции CRM',
      'Приоритетная поддержка 24/7',
      'Расширенная аналитика',
      'Интеграции',
      'Кастомные отчеты',
      'Резервное копирование',
    ],
    limits: {
      users: 50,
      projects: -1, // unlimited
      storage: 100,
    },
  },
  {
    id: 'enterprise',
    name: 'Корпоративный',
    description: 'Для крупных компаний',
    price: 9990,
    period: 'month',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Неограниченно пользователей',
      'Неограниченно проектов',
      '1 TB хранилища',
      'Все функции CRM',
      'Персональный менеджер',
      'SLA 99.9%',
      'Кастомные интеграции',
      'On-premise опция',
      'Обучение команды',
      'Приоритетная разработка',
    ],
    limits: {
      users: -1, // unlimited
      projects: -1,
      storage: 1000,
    },
  },
];

export function Pricing() {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    if (planId === 'free') {
      // Бесплатный план - сразу на onboarding
      navigate('/onboarding?plan=free');
    } else {
      // Платные планы - на страницу оплаты (потом вернется на onboarding)
      // TODO: Интеграция с ЮKassa
      navigate(`/checkout?plan=${planId}&period=${billingPeriod}`);
    }
  };

  const getPrice = (plan: PricingPlan) => {
    if (plan.price === 0) return 'Бесплатно';
    const price = billingPeriod === 'year' ? Math.round(plan.price * 12 * 0.8) : plan.price;
    const period = billingPeriod === 'year' ? 'год' : 'месяц';
    return `${price.toLocaleString('ru-RU')} ₽/${period}`;
  };

  const getYearlyDiscount = (plan: PricingPlan) => {
    if (plan.price === 0 || billingPeriod === 'month') return null;
    const monthlyTotal = plan.price * 12;
    const yearlyPrice = Math.round(plan.price * 12 * 0.8);
    const savings = monthlyTotal - yearlyPrice;
    return `Экономия ${savings.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Выберите план подписки
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Начните бесплатно и масштабируйтесь по мере роста вашего бизнеса
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={billingPeriod === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('month')}
              className="min-w-[100px]"
            >
              Ежемесячно
            </Button>
            <Button
              variant={billingPeriod === 'year' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('year')}
              className="min-w-[100px]"
            >
              Годовой
              <Badge variant="secondary" className="ml-2 text-xs">
                -20%
              </Badge>
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const discount = getYearlyDiscount(plan);
            const isPopular = plan.popular;

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col transition-all hover:shadow-lg',
                  isPopular && 'border-primary shadow-md scale-105'
                )}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Популярный
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary w-fit">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-sm min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">
                      {getPrice(plan)}
                    </div>
                    {discount && (
                      <Badge variant="secondary" className="text-xs">
                        {discount}
                      </Badge>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Пользователи:</span>
                      <span className="font-medium">
                        {plan.limits.users === -1 ? '∞' : plan.limits.users}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Проекты:</span>
                      <span className="font-medium">
                        {plan.limits.projects === -1 ? '∞' : plan.limits.projects}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Хранилище:</span>
                      <span className="font-medium">
                        {plan.limits.storage === 1000 ? '1 TB' : `${plan.limits.storage} GB`}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Включено:</div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    className="w-full"
                    variant={isPopular ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.price === 0 ? 'Начать бесплатно' : 'Выбрать план'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Часто задаваемые вопросы
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Можно ли изменить план позже?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Да, вы можете изменить план в любое время. При переходе на более дорогой план
                  разница будет пропорционально списана. При переходе на более дешевый план
                  остаток средств вернется на счет.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Есть ли пробный период?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Бесплатный план доступен навсегда. Для платных планов доступен 14-дневный
                  пробный период без необходимости указывать данные карты.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Какие способы оплаты доступны?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Мы принимаем оплату банковскими картами (Visa, Mastercard, МИР) через ЮKassa,
                  а также переводы для корпоративных клиентов.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

