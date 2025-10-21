const CACHE_NAME = "chequeoapp-v3";
const urlsToCache = [
  "./",
  "./index.html",
  "./css/styleapp.css",
  "./css/splash.css",
  "./js/scriptapp.js",
  "./img/logo-chequeoapp.png",
  "./img/favicon-logo-chequeoapp.png",
  "./img/splash-512x512.png"
];

// Instalar y cachear archivos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Interceptar peticiones y responder desde cache o red
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});
