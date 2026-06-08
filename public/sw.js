// Service Worker for SummitPass PWA installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through to network. Relies on standard HTTP cache policies.
  // This is the safest approach for dynamic Next.js apps with API routes.
  event.respondWith(fetch(event.request));
});
