// WanderLog PWA Service Worker
// Version: 1.1.0

const CACHE_NAME = 'wanderlog-v1.1.0';
const STATIC_CACHE = 'wanderlog-static-v1.1.0';
const DYNAMIC_CACHE = 'wanderlog-dynamic-v1.1.0';

// Files to cache immediately (App Shell)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/sw-register.js',
  './icons/favicon.svg',
  './icons/favicon.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png'
];

// Routes that should always go to the network first
const NETWORK_FIRST_ROUTES = [
  '/api/',
  '/auth/'
];

// Routes that should be cached first
const CACHE_FIRST_ROUTES = [
  '/css/',
  '/js/',
  '/icons/',
  '/images/'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching app shell and static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Error caching static assets:', error);
      })
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch Event - Handle network requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleFetchRequest(request, url)
  );
});

// Handle different types of fetch requests
async function handleFetchRequest(request, url) {
  try {
    // Check if it's a network-first route
    if (NETWORK_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
      return await networkFirstStrategy(request);
    }
    
    // Check if it's a cache-first route
    if (CACHE_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
      return await cacheFirstStrategy(request);
    }
    
    // For navigation requests (HTML pages), use stale-while-revalidate
    if (request.mode === 'navigate') {
      return await staleWhileRevalidateStrategy(request);
    }
    
    // Default to stale-while-revalidate for everything else
    return await staleWhileRevalidateStrategy(request);
    
  } catch (error) {
    console.error('Error handling fetch request:', error);
    return await getOfflineFallback(request);
  }
}

// Cache-First Strategy (for static assets)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    return await getOfflineFallback(request);
  }
}

// Network-First Strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
    
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || getOfflineFallback(request);
  }
}

// Stale-While-Revalidate Strategy (for general content)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  return cachedResponse || fetchPromise;
}

// Get offline fallback
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For navigation requests, return the main page from cache
  if (request.mode === 'navigate') {
    const cachedPage = await caches.match('./index.html');
    if (cachedPage) {
      return cachedPage;
    }
  }
  
  // For images, return a placeholder if available
  if (request.destination === 'image') {
    return new Response('', {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
  
  // Return a generic offline response
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  try {
    console.log('Handling background sync...');
    
    // Get pending sync items from IndexedDB or localStorage
    const clients = await self.clients.matchAll();
    
    // Notify clients about sync
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        message: 'Syncing data...'
      });
    });
    
    // In a real app, you would sync data with your server here
    // For now, we'll just log the action
    console.log('Background sync completed');
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push Notifications (optional)
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Explore',
          icon: './icons/explore-icon.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: './icons/close-icon.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification('WanderLog', options)
    );
  }
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/?shortcut=explore')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message Handler (for communication with the main app)
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
});

// Error Handler
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

// Unhandled Rejection Handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
  event.preventDefault();
});

console.log('WanderLog Service Worker v1.1.0 loaded');
