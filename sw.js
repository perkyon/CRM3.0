// Service Worker for caching and offline support
// Версия кеша обновляется при каждом деплое (можно использовать timestamp или hash)
const CACHE_VERSION = Date.now();
const CACHE_NAME = `crm-v${CACHE_VERSION}`;
const STATIC_CACHE = `crm-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `crm-dynamic-v${CACHE_VERSION}`;

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  // Пропускаем ожидание, чтобы новый SW активировался сразу
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Удаляем все старые кеши
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(`v${CACHE_VERSION}`)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Берем контроль над всеми клиентами
      return self.clients.claim();
    })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Fetch event - network first strategy for better updates
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Для index.html и sw.js - всегда сеть, без кеша
  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/sw.js') {
    event.respondWith(
      fetch(request).catch(() => {
        // Только если сеть недоступна, пробуем кеш
        return caches.match(request);
      })
    );
    return;
  }

  // Для assets - кеш с проверкой обновлений
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Пробуем сеть для проверки обновлений
          return fetch(request).then((networkResponse) => {
            // Обновляем кеш если получили новый ответ
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Если сеть недоступна, используем кеш
            return cachedResponse || new Response('Offline', { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Для API - network first с кешем для оффлайна
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Кешируем только успешные ответы
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Возвращаем кеш только если сеть недоступна
            return cache.match(request);
          });
      })
    );
    return;
  }

  // Для остальных файлов - network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
  try {
    const offlineActions = await getOfflineActions();
    for (const action of offlineActions) {
      await processOfflineAction(action);
    }
    await clearOfflineActions();
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineActions() {
  // Get stored offline actions from IndexedDB
  return [];
}

async function processOfflineAction(action) {
  // Process individual offline action
  console.log('Processing offline action:', action);
}

async function clearOfflineActions() {
  // Clear processed offline actions
  console.log('Clearing offline actions');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: 'explore',
          title: 'Открыть',
          icon: '/icon-192x192.png',
        },
        {
          action: 'close',
          title: 'Закрыть',
          icon: '/icon-192x192.png',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
