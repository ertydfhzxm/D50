const CACHE_NAME = 'landing-c-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/experience.html',
    '/css/style.css',
    '/css/auth.css',
    '/css/experience.css',
    '/js/auth.js',
    '/js/main.js',
    '/js/experience.js',
    '/assets/images/ai-avatar.png',
    '/assets/images/hero-bg.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
