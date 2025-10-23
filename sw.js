
      const CACHE_NAME = 'pwa-cache-v1';
      const urlsToCache = ["/","./index.html","./manifest.json","./icon.png","/shortcut-96.png","/shortcut-192.png"];

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then((cache) => {
              console.log('Opened cache');
              return cache.addAll(urlsToCache);
            })
        );
        self.skipWaiting();
      });

      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
          })
        );
        self.clients.claim();
      });

      self.addEventListener('fetch', (event) => {
        // For navigation requests, try network first, then offline page.
        if (event.request.mode === 'navigate') {
          event.respondWith(
            (async () => {
              try {
                const networkResponse = await fetch(event.request);
                return networkResponse;
              } catch (error) {
                 return new Response("You are offline. Please check your internet connection.", { status: 404, statusText: "Offline", headers: { 'Content-Type': 'text/html' }})
              }
            })()
          );
          return;
        }

        // For API routes, always fetch from network (no caching)
        if (event.request.url.includes('/api/')) {
          event.respondWith(fetch(event.request));
          return;
        }

        // For all other requests, try cache first, then network.
        // This is a cache-first strategy.
        event.respondWith(
          caches.match(event.request)
            .then((response) => {
              return response || fetch(event.request).catch(async (error) => {
                 // If network fails for a non-navigation request, try the cache one last time
                 const cachedResponse = await caches.match(event.request);
                 if (cachedResponse) return cachedResponse;

                 // If it's still not in cache, then it's a genuine failure
                 console.log('Fetch failed for non-navigation request:', event.request.url, error);
                 // The browser will handle the error (e.g., broken image).
                 throw error;
              });
            }
          )
        );
      });
      
      
    