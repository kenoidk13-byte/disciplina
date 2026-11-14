/* Disciplina — офлайн-кэш оболочки */
var CACHE = 'disciplina-v6';
var FILES = [
  './',
  'index.html',
  'app.css',
  'data.js',
  'app.js',
  'ui.js',
  'manifest.webmanifest',
  'logo.svg',
  'icon.svg',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* сеть в приоритете, кэш — если офлайн */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('index.html', copy); });
        return res;
      }).catch(function () { return caches.match('index.html'); })
    );
    return;
  }

  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req);
    })
  );
});
