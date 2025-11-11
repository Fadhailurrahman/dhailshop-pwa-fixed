const CACHE_NAME = 'dhshop-cache-v2';
const DATA_CACHE_NAME = 'dhshop-data-cache-v2';

const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './images/logo.png',
  './styles/styles.css',
  './scripts/index.js'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (
    request.url.includes('vite') ||
    request.url.includes('hot') ||
    request.url.includes('@fs') ||
    request.url.includes('sockjs-node')
  ) {
    return;
  }

  if (request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.status === 200) cache.put(request, response.clone());
          return response;
        } catch {
          return (await cache.match(request)) || new Response('Offline', { status: 503 });
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        if (request.mode === 'navigate') {
          return caches.match('./offline.html');
        } else if (request.destination === 'image') {
          return caches.match('./images/logo.png');
        }
        return new Response('Offline', { status: 503 });
      }
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Pesan Baru', body: event.data?.text() };
  }

  const title = data.title || "Notifikasi dh@'ilShop.id";
  const options = {
    body: data.body || 'Ada info terbaru untukmu!',
    icon: '/images/icon-192.png',
    badge: '/images/icon-144.png',
    data: { url: data.url || '/' },
    actions: [{ action: 'open', title: 'Lihat Detail' }]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.action === 'open' ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
