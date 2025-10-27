const CACHE='rf-fresh-v1';
const ASSETS=['./','./index.html','./styles.css','./script.js','./manifest.webmanifest',
'./assets/plan.json','./assets/logo.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
