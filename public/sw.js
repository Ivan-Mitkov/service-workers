// triggered by web browser
self.addEventListener("install", (event) => {
  const preCache = async () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
    const cache = await caches.open("static"); //name of the cache we choose
    // add content to the cache - path from sw
    // this is like url not paths
    return cache.addAll([
      "/",
      "/src/js/",
      "/src/css/",
      "/src/images/main-image.jpg",
      "/favicon.ico",
      "/index.html",
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
  return self.clients.claim();
});

// triggered by web app
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      //if in cache return from cache
      if (response) {
        return response;
        // else fetch data from net
      } else {
        return fetch(e.request);
      }
    })
  );
});
