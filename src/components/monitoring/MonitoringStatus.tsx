import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Smartphone, 
  Monitor,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAnalytics } from '../../lib/hooks/useAnalytics';

interface MonitoringStatusProps {
  className?: string;
}

export function MonitoringStatus({ className }: MonitoringStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWA, setIsPWA] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { trackUserAction } = useAnalytics();

  useEffect(() => {
    // Проверяем статус PWA
    const checkPWA = () => {
      const isPWAMode = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone ||
                       document.referrer.includes('android-app://');
      setIsPWA(isPWAMode);
    };

    // Проверяем Service Worker
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && registration.active) {
            setServiceWorkerStatus('active');
          } else {
            setServiceWorkerStatus('error');
          }
        } catch (error) {
          setServiceWorkerStatus('error');
        }
      } else {
        setServiceWorkerStatus('error');
      }
    };

    // Отслеживание сетевого статуса
    const handleOnline = () => {
      setIsOnline(true);
      setLastUpdate(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastUpdate(new Date());
    };

    checkPWA();
    checkServiceWorker();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Обновляем время каждую минуту
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleTestConnection = () => {
    trackUserAction('test_connection_clicked', {
      isOnline,
      isPWA,
      serviceWorkerStatus,
    });

    // Простой тест подключения
    fetch('/api/health', { method: 'HEAD' })
      .then(() => {
        setIsOnline(true);
        setLastUpdate(new Date());
      })
      .catch(() => {
        setIsOnline(false);
        setLastUpdate(new Date());
      });
  };

  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="size-4" />
          Статус мониторинга
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Сетевой статус */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="size-4 text-green-600" />
            ) : (
              <WifiOff className="size-4 text-red-600" />
            )}
            <span className="text-sm">Подключение</span>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'Онлайн' : 'Офлайн'}
          </Badge>
        </div>

        {/* PWA статус */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="size-4" />
            <span className="text-sm">PWA режим</span>
          </div>
          <Badge variant={isPWA ? 'default' : 'secondary'}>
            {isPWA ? 'Активен' : 'Браузер'}
          </Badge>
        </div>

        {/* Service Worker статус */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {serviceWorkerStatus === 'active' ? (
              <CheckCircle className="size-4 text-green-600" />
            ) : serviceWorkerStatus === 'error' ? (
              <AlertCircle className="size-4 text-red-600" />
            ) : (
              <Clock className="size-4 text-yellow-600" />
            )}
            <span className="text-sm">Service Worker</span>
          </div>
          <Badge 
            variant={
              serviceWorkerStatus === 'active' ? 'default' : 
              serviceWorkerStatus === 'error' ? 'destructive' : 'secondary'
            }
          >
            {serviceWorkerStatus === 'active' ? 'Активен' : 
             serviceWorkerStatus === 'error' ? 'Ошибка' : 'Загрузка'}
          </Badge>
        </div>

        {/* Тип устройства */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="size-4" />
            <span className="text-sm">Устройство</span>
          </div>
          <Badge variant="outline">
            {getDeviceType()}
          </Badge>
        </div>

        {/* Последнее обновление */}
        <div className="text-xs text-muted-foreground">
          Обновлено: {lastUpdate.toLocaleTimeString()}
        </div>

        {/* Кнопка тестирования */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleTestConnection}
        >
          Тест подключения
        </Button>
      </CardContent>
    </Card>
  );
}
