self.addEventListener("install", function (e) {
  console.log("[servisce worker install]", e);
});

self.addEventListener("activate", function (e) {
  console.log("[servisce worker activate]", e);
  return self.clients.claim();
});
