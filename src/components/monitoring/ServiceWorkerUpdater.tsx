import { useEffect } from 'react';
import { useServiceWorker } from '../../lib/hooks/useServiceWorker';

export function ServiceWorkerUpdater() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (updateAvailable) {
      console.log('[SW Updater] Update available, applying...');
      // Автоматически применяем обновление
      updateServiceWorker();
      // Перезагружаем страницу через небольшую задержку
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [updateAvailable, updateServiceWorker]);

  return null;
}

