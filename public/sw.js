// triggered by web browser
self.addEventListener("install", function (e) {
  console.log("[servisce worker install]", e);
});
// triggered by web browser
self.addEventListener("activate", function (e) {
  console.log("[servisce worker activate]", e);
  return self.clients.claim();
});

// triggered by web app
self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request));
});
