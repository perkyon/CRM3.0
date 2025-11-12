import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: navigator.onLine,
    registration: null,
    updateAvailable: false,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    let updateInterval: NodeJS.Timeout | null = null;

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none', // Всегда проверяем обновления
        });
        
        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Проверяем обновления при загрузке
        await registration.update();

        // Check for updates
        const handleUpdateFound = () => {
          console.log('[SW] Update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('[SW] New worker state:', newWorker.state);
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Есть новый SW, но старый еще активен
                  console.log('[SW] New service worker available - applying update');
                  setState(prev => ({ ...prev, updateAvailable: true }));
                  // Автоматически применяем обновление
                  if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }
                } else {
                  // Первая установка
                  console.log('[SW] Service worker installed for the first time');
                }
              } else if (newWorker.state === 'activated') {
                // Новый SW активирован - перезагружаем страницу
                console.log('[SW] New service worker activated - reloading');
                window.location.reload();
              }
            });
          }
        };

        registration.addEventListener('updatefound', handleUpdateFound);

        // Проверяем, есть ли уже ожидающий SW
        if (registration.waiting) {
          console.log('[SW] Waiting service worker found - applying update');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Периодически проверяем обновления (каждую минуту)
        updateInterval = setInterval(() => {
          console.log('[SW] Checking for updates...');
          registration.update();
        }, 60 * 1000); // Каждую минуту

        // Listen for controller changes
        const handleControllerChange = () => {
          console.log('[SW] Controller changed, reloading...');
          window.location.reload();
        };
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

        return () => {
          registration.removeEventListener('updatefound', handleUpdateFound);
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          if (updateInterval) {
            clearInterval(updateInterval);
          }
        };

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    const cleanup = registerSW();

    // Listen for online/offline events
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [state.isSupported]);

  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const unregisterServiceWorker = async () => {
    if (state.registration) {
      await state.registration.unregister();
      setState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
      }));
    }
  };

  return {
    ...state,
    updateServiceWorker,
    unregisterServiceWorker,
  };
}
