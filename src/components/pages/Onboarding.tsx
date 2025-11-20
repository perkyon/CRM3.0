import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Building2, User, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { organizationService } from '../../lib/supabase/services/OrganizationService';
import { SubscriptionPlan } from '../../types';
import { supabase } from '../../lib/supabase/config';
import { useAuthStore } from '../../lib/stores/authStore';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Создание организации',
    description: 'Укажите название вашей компании',
  },
  {
    id: 2,
    title: 'Настройка аккаунта',
    description: 'Заполните данные администратора',
  },
  {
    id: 3,
    title: 'Готово!',
    description: 'Ваша организация создана',
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const authStore = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Форма организации
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [website, setWebsite] = useState('');

  // Форма пользователя
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Заполнение данных из URL (если пришли после оплаты) или из state (если пришли после регистрации)
  useEffect(() => {
    // Проверяем state из навигации (после регистрации)
    const state = location.state as any;
    if (state) {
      if (state.orgName) setOrgName(state.orgName);
      if (state.orgSlug) setOrgSlug(state.orgSlug);
      if (state.userName) setUserName(state.userName);
      if (state.userEmail) setUserEmail(state.userEmail);
    }

    // Проверяем URL параметры (после оплаты)
    const urlOrgName = searchParams.get('org_name');
    const urlOrgSlug = searchParams.get('org_slug');
    const urlUserName = searchParams.get('user_name');
    const urlUserEmail = searchParams.get('user_email');
    const urlUserPhone = searchParams.get('user_phone');
    const urlWebsite = searchParams.get('website');

    if (urlOrgName) setOrgName(urlOrgName);
    if (urlOrgSlug) setOrgSlug(urlOrgSlug);
    if (urlUserName) setUserName(urlUserName);
    if (urlUserEmail) setUserEmail(urlUserEmail);
    if (urlUserPhone) setUserPhone(urlUserPhone);
    if (urlWebsite) setWebsite(urlWebsite);
  }, [searchParams, location]);

  // Генерация slug из названия
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOrgNameChange = (value: string) => {
    setOrgName(value);
    if (!orgSlug || orgSlug === generateSlug(orgName)) {
      setOrgSlug(generateSlug(value));
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Валидация шага 1
      if (!orgName.trim()) {
        setError('Укажите название организации');
        return;
      }
      if (!orgSlug.trim()) {
        setError('Slug не может быть пустым');
        return;
      }
      setError(null);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Если организация уже создана (пришли после регистрации), просто переходим дальше
      const state = location.state as any;
      if (state?.orgName) {
        // Организация уже создана, просто выполняем вход если нужно
        setCurrentStep(3);
        return;
      }

      // Валидация шага 2
      if (!userName.trim()) {
        setError('Укажите ваше имя');
        return;
      }
      if (!userEmail.trim() || !userEmail.includes('@')) {
        setError('Укажите корректный email');
        return;
      }
      
      // Создание организации и пользователя
      setIsLoading(true);
      setError(null);
      
      try {
        const plan = (searchParams.get('plan') || 'free') as SubscriptionPlan;
        
        // Генерируем временный пароль
        const generatedPassword = Math.random().toString(36).slice(-12) + 'A1!';
        
        await organizationService.createOrganizationWithUser({
          organization: {
            name: orgName,
            slug: orgSlug,
            website: website || undefined,
          },
          user: {
            name: userName,
            email: userEmail,
            phone: userPhone || undefined,
            password: generatedPassword,
          },
          subscriptionPlan: plan,
        });
        
        // После создания организации выполняем вход
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: generatedPassword,
        });
        
        if (signInError) {
          console.error('Ошибка входа после регистрации:', signInError);
          // Продолжаем, так как пользователь уже создан
        } else if (sessionData?.user) {
          // Загружаем данные пользователя в authStore
          const { supabaseUserService } = await import('../../lib/supabase/services/UserService');
          const userData = await supabaseUserService.getUser(sessionData.user.id);
          if (userData) {
            authStore.updateUser(userData);
            useAuthStore.setState({
              ...authStore,
              user: userData,
              isAuthenticated: true,
              accessToken: sessionData.session?.access_token,
              refreshToken: sessionData.session?.refresh_token,
            });
          }
        }
        
        // TODO: Отправить email с данными для входа
        // await sendWelcomeEmail({
        //   email: userEmail,
        //   password: generatedPassword,
        //   organizationName: orgName,
        // });
        
        setCurrentStep(3);
      } catch (err: any) {
        setError(err.message || 'Ошибка при создании организации');
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 3) {
      // Переход в систему
      navigate('/app/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Добро пожаловать в Buro CRM!</CardTitle>
          <CardDescription>
            Давайте настроим вашу организацию за несколько шагов
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Прогресс */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                      currentStep > step.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 transition-colors',
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Шаг 1: Создание организации */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Информация об организации</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName">Название организации *</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => handleOrgNameChange(e.target.value)}
                    placeholder="Например: Мебельная мастерская"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="orgSlug">URL организации *</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-muted-foreground">burodigital.ru/</span>
                    <Input
                      id="orgSlug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      placeholder="my-workshop"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Используется для создания уникального URL вашей организации
                  </p>
                </div>

                <div>
                  <Label htmlFor="website">Веб-сайт (необязательно)</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Шаг 2: Настройка аккаунта */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Данные администратора</h3>
              </div>

              {(location.state as any)?.orgName ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-muted-foreground">
                    Организация "{orgName}" уже создана!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Вы будете перенаправлены в систему...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Ваше имя *</Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Иван Иванов"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="userEmail">Email *</Label>
                    <Input
                      id="userEmail"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="ivan@example.com"
                      type="email"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Будет использован для входа в систему
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="userPhone">Телефон (необязательно)</Label>
                    <Input
                      id="userPhone"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      type="tel"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Шаг 3: Готово */}
          {currentStep === 3 && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
              <h3 className="text-2xl font-semibold">Организация создана!</h3>
              <p className="text-muted-foreground">
                Вы будете перенаправлены в систему через несколько секунд...
              </p>
            </div>
          )}

          {/* Ошибка */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Кнопки навигации */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
            >
              Назад
            </Button>
            <Button
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : currentStep === 3 ? (
                'Перейти в систему'
              ) : (
                'Далее'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

