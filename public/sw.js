const CACHE_STATIC_NAME = "static-v5";

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
    // console.log("[response]", response);
    // create new cache and call it dynamic
    const cache = await caches.open("dynamic");
    //save a copy of the response with key url and value the response
    //Clone is needed because put() consumes the response body
    //save a copy of the response in order not to consume it
    console.log("[URL]", event.request.url);
    cache.put(event.request.url, response.clone());
    // return what we get from the net
    return response;
  } catch (error) {
    console.log(error);
    // go to static cache and get fallout page
    return caches
      .open(CACHE_STATIC_NAME)
      .then((cache) => cache.match("/offline.html"));
  }
};

// triggered by web app
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      //if in cache return from cache
      if (response) {
        return response;
        // else fetch data from net
      } else {
        console.log("[HERE]");
        return fetchAndSaveIntoDynamicCache(e);
        //and save it into dynamic cache and return the response
        // return fetch(e.request).then((res) => {
        //   return caches.open("dynamic").then((cache) => {
        //     cache.put(e.request.url, res);
        //     return res;
        //   });
        // });
      }
    })
  );
});
