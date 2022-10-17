// triggered by web browser
self.addEventListener("install", (event) => {
  const preCache = async () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage
    const cache = await caches.open("static"); //name of the cache we choose
    // add content to the cache - path from sw
    return cache.addAll([
      "/src/js/",
      "/src/css/",
      "/src/images/",
      "/favicon.ico",
      "/index.html",
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
