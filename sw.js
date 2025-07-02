const CACHE_NAME = 'asteroids-v1.0';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/game.js',
  './js/input.js',
  './js/audio.js',
  './js/audio-generator.js',
  './js/lib/sat.js',
  './js/entities/ship.js',
  './js/entities/asteroid.js',
  './js/entities/ufo.js',
  './js/entities/projectile.js',
  './assets/images/ship.svg',
  './assets/images/asteroid-large.svg',
  './assets/images/asteroid-medium.svg',
  './assets/images/asteroid-small.svg',
  './assets/images/ufo-large.svg',
  './assets/images/ufo-small.svg',
  './assets/images/button-up.svg',
  './assets/images/button-down.svg',
  './assets/images/button-left.svg',
  './assets/images/button-right.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
}); 