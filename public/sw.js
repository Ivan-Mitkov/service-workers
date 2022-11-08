const CACHE_STATIC_NAME = "static-v6";

// triggered by web browser
self.addEventListener("install", (event) => {
  const preCache = async () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
    const cache = await caches.open(CACHE_STATIC_NAME); //name of the cache we choose
    // add content to the cache - path from sw
    // this is like url not paths
    return cache.addAll([
      "/",
      "/src/js/",
      "/src/js/material.min.js",
      "/src/css/",
      "/src/images/main-image.jpg",
      "/favicon.ico",
      "/index.html",
      "/offline.html",
      "https://fonts.googleapis.com/css?family=Roboto:400,700", // pre cache fonts
      "https://fonts.googleapis.com/icon?family=Material+Icons",
      "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
    ]);
  };

  //register cach async
  event.waitUntil(preCache());
});

//function for removing old items in cache
async function trimCache(cacheName, maxItems) {
  // caches.open(cacheName).then((cache) =>
  //   cache.keys().then((keys) => {
  //     if (keys.length > maxItems) {
  //       cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
  //     }
  //   })
  // );
  console.log("STOP recursion");
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}
// triggered by web browser
self.addEventListener("activate", function (e) {
  console.log("[servisce worker activate]", e);
  // clean up old versions of the cache - do it here in order not to mess up with cache in running application
  e.waitUntil(
    caches.keys().then((keysList) => {
      return Promise.all(
        keysList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== "dynamic") {
            caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

const fetchAndSaveIntoDynamicCache = async (event) => {
  try {
    // fetch new data
    const response = await fetch(event.request);
    // create new cache and call it dynamic
    const cache = await caches.open("dynamic");
    console.log("fetchAndSaveIntoDynamicCache", cache);
    //save a copy of the response with key url and value the response
    //Clone is needed because put() consumes the response body
    //save a copy of the response in order not to consume it
    console.log("[URL]", event.request.url);
    // delete oldest cached items
    // // trimCache("dynamic", 10);
    cache.put(event.request.url, response.clone());
    // return what we get from the net
    return response;
  } catch (error) {
    // go to static cache and get fallout page
    return caches.open(CACHE_STATIC_NAME).then((cache) => {
      // if (event.request.url.includes("help")) {
      //   return cache.match("/offline.html");
      // }
      if (event.request.headers.get("accept").includes("text/html")) {
        return cache.match("/offline.html");
      }
      return cache.match(event.request);
    });
  }
};

// triggered by web app

// cache with network fallback
// self.addEventListener("fetch", (e) => {
//   e.respondWith(
//     caches.match(e.request).then((response) => {
//       //if in cache return from cache
//       if (response) {
//         return response;
//         // else fetch data from net
//       } else {
//         console.log("[HERE]");
//         return fetchAndSaveIntoDynamicCache(e);
//         //and save it into dynamic cache and return the response
//         // return fetch(e.request).then((res) => {
//         //   return caches.open("dynamic").then((cache) => {
//         //     cache.put(e.request.url, res.clone());
//         //     return res;
//         //   });
//         // });
//       }
//     })
//   );
// });

// cache first then network
self.addEventListener("fetch", (e) => {
  const url = "https://httpbin.org/get";
  // used for only this url
  if (e.request.url.indexOf(url) > -1) {
    e.respondWith(
      caches.open("dynamic").then((cache) => {
        return fetch(e.request).then((res) => {
          // delete oldest cached items
          // trimCache("dynamic", 10);
          cache.put(e.request, res.clone());
          return res;
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((response) => {
        //if in cache return from cache
        if (response) {
          return response;
          // else fetch data from net
        } else {
          console.log("[HERE]");
          return fetchAndSaveIntoDynamicCache(e);
        }
      })
    );
  }
});

// Network with cache fallback
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then((res) => {
//         // with dynamic cache
//         return caches.open("dynamic").then((cache) => {
//           cache.put(event.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch((e) => {
//         console.log("ERROR FETCHING", e);
//         return caches.open(CACHE_STATIC_NAME).then((cache) => {
//           console.log(event.request.url);
//           if (event.request.url.includes("help")) {
//             return cache.match("/offline.html");
//           }
//           return cache.match(event.request);
//         });
//       })
//   );
// });

// cache only
// self.addEventListener("fetch", (e) => {
//   e.respondWith(caches.match(e.request).then((response) => response));
// });
