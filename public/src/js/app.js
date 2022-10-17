console.log("APP.js", navigator);
if ("serviceWorker" in navigator) {
  console.log("HERE");
  navigator.serviceWorker
    .register("../sw.js")
    .then(function () {
      console.log("Service worker registered!");
    })
    .catch((err) => console.log(err));
}
