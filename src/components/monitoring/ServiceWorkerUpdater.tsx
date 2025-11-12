import { useEffect, useRef } from 'react';
import { useServiceWorker } from '../../lib/hooks/useServiceWorker';

export function ServiceWorkerUpdater() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();
  const hasReloaded = useRef(false);

  useEffect(() => {
    if (updateAvailable && !hasReloaded.current) {
      console.log('[SW Updater] Update available, applying...');
      hasReloaded.current = true;
      // Автоматически применяем обновление
      updateServiceWorker();
      // Перезагрузка произойдет автоматически через controllerchange
    }
  }, [updateAvailable, updateServiceWorker]);

  return null;
}

