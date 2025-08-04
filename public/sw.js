const CACHE_NAME = 'admin-panel-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.origin !== location.origin) {
    return;
  }
  
  // Allow query parameters for legitimate navigation (analytics, filters, etc.)
  if (url.search && (event.request.mode === 'navigate' || event.request.destination === 'document')) {
    // Check if this is a legitimate route that should allow query parameters
    const pathname = url.pathname;
    const allowedQueryRoutes = ['/analytics', '/user-logs', '/reports', '/settings'];
    
    if (allowedQueryRoutes.some(route => pathname.startsWith(route))) {
      // Allow the request to proceed normally
      return;
    }
    
    // For other routes with query parameters, redirect to root
    event.respondWith(
      Response.redirect('/', 302)
    );
    return;
  }
  
  if (url.search) {
    event.respondWith(
      caches.match('/').then((response) => {
        if (response) {
          return response;
        }
        return fetch('/');
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
}); 