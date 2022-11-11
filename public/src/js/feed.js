var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

function openCreatePostModal() {
  createPostArea.style.display = "block";
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function onSaveButtonClick(event) {
  console.log("CLICK");
  // if browser supports sw frontend has acces to caches
  // may be used for example for article to be saved by the user for later reading
  if ("caches" in window) {
    caches.open("user-requested").then((cache) => {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}
function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}
function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${data?.image})`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = `${data?.title}`;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = `${data?.location}`;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement("button");
  // cardSaveButton.textContent = "SAVE";
  // cardSaveButton.addEventListener("click", onSaveButtonClick);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

// data to be saved in dynamic cache on demand
// fetch("https://httpbin.org/get")
//   .then(function (res) {
//     return res.json();
//   })
//   .then(function (data) {
//     createCard();
//   });

const updateUi = (data) => {
  clearCards();
  data.forEach((cart) => createCard(cart));
};
// Cache first then network strategy
// connect to firebase database
const url =
  "https://pwa-service-worker-6baa3-default-rtdb.europe-west1.firebasedatabase.app/posts.json";
let networkDataReceived = false;
// fetch data from the net
fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    const dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    console.log("fetch data from the net");
    updateUi(dataArray);
  });
// fetch data from cache
// if ("caches" in window) {
//   caches
//     .match(url)
//     .then((res) => {
//       if (res) {
//         return res.json();
//       }
//       return res;
//     })
//     .then((data) => {
//       console.log("From cache", data);
//       if (!networkDataReceived) {
//         const dataArray = [];
//         for (let key in data) {
//           dataArray.push(data[key]);
//         }
//         updateUi(dataArray);
//       }
//     });
// }

//get data form indexDB
console.log("indexedDB" in window);
if ("indexedDB" in window) {
  console.log("HERE");
  readDataFromIndexDB("posts").then((data) => {
    console.log(data);
    if (!networkDataReceived) {
      // if no network get data from indexDB
      console.log("from indexDB", data);
      updateUi(data);
    }
  });
}
