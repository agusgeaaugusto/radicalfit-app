const CACHE = 'rf-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './assets/plan.json',
  './assets/logo.svg',
  './assets/icons/icon-64.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-256.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request).then(r=>{
      const copy = r.clone();
      caches.open(CACHE).then(c=> c.put(e.request, copy));
      return r;
    }).catch(()=> caches.match('./index.html')))
  );
});
