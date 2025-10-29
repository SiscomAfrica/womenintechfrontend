// Enhanced service worker for PWA functionality
const CACHE_NAME = 'event-app-v1';
const STATIC_CACHE = 'event-app-static-v1';
const API_CACHE = 'event-app-api-v1';
const IMAGE_CACHE = 'event-app-images-v1';

const urlsToCache = [
  '/',
  '/dashboard',
  '/schedule',
  '/networking',
  '/polls',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Images - Cache first
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Static assets and pages - Cache first, network fallback
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Return offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE, API_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Process offline queue
      processOfflineQueue()
    );
  }
});

async function processOfflineQueue() {
  try {
    // Get offline queue from IndexedDB or localStorage
    const queue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
    
    for (const action of queue) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });
        
        // Remove successful action from queue
        const updatedQueue = queue.filter(item => item.id !== action.id);
        localStorage.setItem('offline-queue', JSON.stringify(updatedQueue));
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Failed to process offline queue:', error);
  }
}