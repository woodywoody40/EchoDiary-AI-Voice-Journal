const CACHE_NAME = 'echodiary-cache-v1';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/index.tsx',
    '/App.tsx',
    '/types.ts',
    '/metadata.json',
    '/components/ConversationView.tsx',
    '/components/JournalView.tsx',
    '/components/DashboardView.tsx',
    '/components/Header.tsx',
    '/components/Settings.tsx',
    '/components/icons/Icons.tsx',
    '/components/Avatar.tsx',
    '/components/BottomNavBar.tsx',
    '/components/ApiKeyModal.tsx',
    '/hooks/useLiveSession.ts',
    '/hooks/useInstallPrompt.ts',
    '/services/geminiService.ts',
    '/utils/moodUtils.tsx',
    '/utils/audioUtils.ts',
    '/utils/localization.ts',
    '/icon-192.png',
    '/icon-512.png',
    '/maskable-icon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching app shell');
            return cache.addAll(APP_SHELL_URLS);
        }).catch(error => {
            console.error('Failed to cache app shell:', error);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }
    
    // For requests to our own origin, use stale-while-revalidate strategy.
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(error => {
                    console.warn('Service Worker: Fetch failed, returning cached response if available.', error);
                });
                
                return cachedResponse || fetchPromise;
            })
        );
    }
    // For other requests (CDNs, etc.), just let them go through.
});