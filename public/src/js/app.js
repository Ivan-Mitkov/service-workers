if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("../sw.js")
    .then(function () {
      console.log("Service worker registered!");
    })
    .catch((err) => console.log(err));
}
