// Aquos Platinum Progressive Web App Service Worker
const CACHE_NAME = 'aquos-platinum-pwa-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Network first strategy with offline fallback
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});
