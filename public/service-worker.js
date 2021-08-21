
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/db.js",
  "/index.js",
  "/styles.css"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function(event) {
    // Perform install steps
    event.waitUntil(
        caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });

// install
// self.addEventListener("install", function(evt) {
//   evt.waitUntil(
//     caches.open(CACHE_NAME).then(cache => {
//       cache.addAll(FILES_TO_CACHE);
//     })
//   );

//   self.skipWaiting();
// });



// fetch
self.addEventListener("fetch", function(evt) {
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


  evt.respondWith(
    fetch(evt.request).catch(function() {
      return caches.match(evt.request).then(function(response) {
        if (response) {
          return response;
        } else if (evt.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      })
      .catch(err => {
        
        return cache.match(evt.request);
      });
    })
  );
});

//   evt.respondWith(
//     caches.match(evt.request).then(function(response) {
//       return response || fetch(evt.request);
//     })
//   );
// });