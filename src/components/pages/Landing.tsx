import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { 
  Zap, 
  Users, 
  FolderKanban, 
  BarChart3, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Building2,
  Rocket,
  Star
} from 'lucide-react';
import { cn } from '../ui/utils';

export function Landing() {
  const navigate = useNavigate();
  const [orgSlug, setOrgSlug] = useState('');

  const handleOrgLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (orgSlug.trim()) {
      navigate(`/org/${orgSlug.trim()}/login`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Rocket className="w-4 h-4" />
              <span>Современная CRM для мебельных мастерских</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Управляйте бизнесом
              <br />
              <span className="text-primary">с умом</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Полный цикл от клиента до производства. Увеличьте эффективность и контролируйте каждый этап работы.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => navigate('/pricing')}
              >
                Начать бесплатно
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={() => navigate('/pricing')}
              >
                Посмотреть тарифы
              </Button>
            </div>

            {/* Вход в компанию */}
            <Card className="mt-12 max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Вход в компанию</h3>
                </div>
                <form onSubmit={handleOrgLogin} className="flex gap-2">
                  <Input
                    placeholder="my-workshop"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline">
                    Войти
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2">
                  Введите slug вашей организации
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Все необходимое в одном месте</h2>
              <p className="text-xl text-muted-foreground">
                Управляйте клиентами, проектами и производством без лишних сложностей
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Начните с бесплатного плана</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Все функции доступны сразу. Масштабируйте по мере роста бизнеса.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/pricing')}
              className="text-lg px-8"
            >
              Посмотреть все тарифы
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">Готовы начать?</h2>
            <p className="text-xl opacity-90">
              Присоединяйтесь к сотням мастерских, которые уже используют Buro CRM
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8"
              onClick={() => navigate('/pricing')}
            >
              Создать аккаунт бесплатно
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Buro CRM</h3>
                <p className="text-muted-foreground">CRM для мебельных мастерских</p>
              </div>
              <div className="flex gap-6">
                <Button variant="ghost" onClick={() => navigate('/pricing')}>
                  Тарифы
                </Button>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Вход
                </Button>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              © 2025 Buro CRM. Все права защищены.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: 'Управление клиентами',
    description: 'Вся информация о клиентах в одном месте. История взаимодействий, документы, проекты.',
  },
  {
    icon: <FolderKanban className="w-6 h-6 text-primary" />,
    title: 'Управление проектами',
    description: 'От брифования до производства. Контролируйте каждый этап проекта.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-primary" />,
    title: 'Аналитика и отчеты',
    description: 'Отслеживайте метрики, анализируйте эффективность, принимайте решения на основе данных.',
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: 'Автоматизация',
    description: 'Автоматизируйте рутинные задачи и фокусируйтесь на важном.',
  },
  {
    icon: <Shield className="w-6 h-6 text-primary" />,
    title: 'Безопасность',
    description: 'Ваши данные защищены. Каждая организация изолирована от других.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
    title: 'Простота использования',
    description: 'Интуитивный интерфейс. Начните работать за минуты, без обучения.',
  },
];

