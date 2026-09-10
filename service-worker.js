const CACHE_NAME = 'pch-site-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/contact.html',
  '/about.html',
  '/apply.html',
  '/sweepstakes.html',
  '/winners.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/pwa.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/superprize.jpg',
  '/pchapp.jpg'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    }).catch((err) => {
      console.warn('Service worker install failed:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') return;

  const acceptHeader = evt.request.headers.get('accept') || '';
  const isNavigationRequest = evt.request.mode === 'navigate' || acceptHeader.includes('text/html');

  if (isNavigationRequest) {
    evt.respondWith(
      fetch(evt.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(evt.request).then((cachedResponse) => cachedResponse || caches.match('/index.html')))
    );
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      const fetchPromise = fetch(evt.request).then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, responseClone));
        }
        return response;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    }).catch(() => caches.match('/index.html'))
  );
});
