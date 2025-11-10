const CACHE_NAME = 'dhshop-cache-v1';
const DATA_CACHE_NAME = 'dhshop-data-cache-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html', 
  '/images/logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
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
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return cache.match(request);
        }
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      return (
        response ||
        fetch(request).catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        })
      );
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
    icon: data.icon || '/images/logo.png',
    badge: '/images/logo.png',
    data: { url: data.url || '/' },
    actions: [{ action: 'open', title: 'Lihat Detail' }]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.action === 'open' ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
