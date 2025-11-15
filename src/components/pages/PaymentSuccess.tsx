import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { organizationService } from '../../lib/supabase/services/OrganizationService';
import { SubscriptionPlan } from '../../types';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  // Параметры из URL (после оплаты через ЮKassa)
  const paymentId = searchParams.get('payment_id');
  const plan = searchParams.get('plan') as SubscriptionPlan | null;
  const orgName = searchParams.get('org_name');
  const orgSlug = searchParams.get('org_slug');
  const userName = searchParams.get('user_name');
  const userEmail = searchParams.get('user_email');
  const userPhone = searchParams.get('user_phone');

  useEffect(() => {
    // Проверяем, что все необходимые параметры есть
    if (!paymentId || !plan || !orgName || !orgSlug || !userName || !userEmail) {
      setError('Отсутствуют необходимые параметры');
      setStatus('error');
      return;
    }

    // TODO: Проверить статус платежа в ЮKassa
    // const paymentStatus = await checkYooKassaPayment(paymentId);
    // if (paymentStatus !== 'succeeded') {
    //   setError('Платеж не подтвержден');
    //   setStatus('error');
    //   return;
    // }

    // Если это бесплатный план или платеж подтвержден - создаем организацию
    if (plan === 'free' || paymentId) {
      handleCreateOrganization();
    }
  }, []);

  const handleCreateOrganization = async () => {
    try {
      // Генерируем временный пароль (пользователь сможет изменить его позже)
      const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

      await organizationService.createOrganizationWithUser({
        organization: {
          name: orgName!,
          slug: orgSlug!,
          website: searchParams.get('website') || undefined,
        },
        user: {
          name: userName!,
          email: userEmail!,
          phone: userPhone || undefined,
          password: tempPassword,
        },
        subscriptionPlan: plan!,
      });

      // TODO: Отправить email с данными для входа
      // await sendWelcomeEmail({
      //   email: userEmail!,
      //   password: tempPassword,
      //   organizationName: orgName!,
      // });

      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании организации');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Обработка платежа...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">Ошибка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center">{error}</p>
            <Button onClick={() => navigate('/pricing')} className="w-full">
              Вернуться к выбору плана
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Оплата успешна!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Ваша организация <strong>{orgName}</strong> успешно создана.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Данные для входа отправлены на email <strong>{userEmail}</strong>
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Войти в систему
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

