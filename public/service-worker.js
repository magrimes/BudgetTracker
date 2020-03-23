const FILES_TO_CACHE = [
  "/",
  // "/index.html",
  "/style.css",
  // "/manifest.json",
  // "/db.js"
  "/index.js"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
          console.log("Your files were pre-cached successfully!");
          return cache.addAll(FILES_TO_CACHE);
      })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
  evt.waitUntil(
      caches.keys().then(keyList => {
          return Promise.all(
              keyList.map(key => {
                  if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                      console.log("Removing old cache data", key);
                      return caches.delete(key);
                  }
              })
          );
      })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", function (evt) {
  // cache successful requests to the API
  if (evt.request.url.includes("/api/")) {
      evt.respondWith(
          caches.open(DATA_CACHE_NAME).then(cache => {
              return fetch(evt.request)
                  .then(response => {
                      // If the response was good, clone it and store it in the cache.
                      if (response.status === 200) {
                          cache.put(evt.request.url, response.clone());
                      }

                      return response;
                  })
                  .catch(err => {
                      // Network request failed, try to get it from the cache.
                      return cache.match(evt.request);
                  });
          }).catch(err => console.log(err))
      );

      return;
  }

  // if the request is not for the API, serve static assets using "offline-first" approach.
  // see https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook#cache-falling-back-to-network
  evt.respondWith(
      caches.match(evt.request).then(function (response) {
          return response || fetch(evt.request);
      })
  );
});




// const FILES_TO_CACHE = [
//   "/",
//   "/index.html",
//   "./assets/css.style.css",
//   "/index.js"
// ];

// const PRECACHE = "precache-v1";
// const RUNTIME = "runtime";

// self.addEventListener("install", event => {
//   event.waitUntil(
//     caches.open(PRECACHE)
//       .then(cache => cache.addAll(FILES_TO_CACHE))
//       .then(self.skipWaiting())
//   );
// });

// // The activate handler takes care of cleaning up old caches.
// self.addEventListener("activate", event => {
//   const currentCaches = [PRECACHE, RUNTIME];
//   event.waitUntil(
//     caches.keys().then(cacheNames => {
//       return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
//     }).then(cachesToDelete => {
//       return Promise.all(cachesToDelete.map(cacheToDelete => {
//         return caches.delete(cacheToDelete);
//       }));
//     }).then(() => self.clients.claim())
//   );
// });

// self.addEventListener("fetch", event => {
//   if (event.request.url.startsWith(self.location.origin)) {
//     event.respondWith(
//       caches.match(event.request).then(cachedResponse => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }

//         return caches.open(RUNTIME).then(cache => {
//           return fetch(event.request).then(response => {
//             return cache.put(event.request, response.clone()).then(() => {
//               return response;
//             });
//           });
//         });
//       })
//     );
//   }

//   evt.respondWith(
//     caches.match(evt.request).then(function (response) {
//       return response || fetch(evt.request);
//     })
//   );
  
// });
