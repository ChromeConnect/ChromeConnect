//fetch all topics and store into local storage as soon as background is injected

var db = null;
self.importScripts("firebase/app.js", "firebase/realtimedatabase.js");
firebaseConfig = {};

firebase.initializeApp(firebaseConfig);

function fetchAllTopics() {
  firebase
    .database()
    .ref()
    .child("sequelize")
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        //set topics into local storage for popup to fetch
        chrome.storage.local.set({
          topics: snapshot.val(),
        });
      } else {
        console.log("No data available");
      }
    });
}

fetchAllTopics();

//set default name when user first loads website
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    name: "randomUser123",
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "get_name") {
    chrome.storage.local.get("name", (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          message: "fail",
        });

        return;
      }

      sendResponse({
        message: "success",
        payload: data.name,
      });
    });

    return true;
  } else if (request.message === "change_name") {
    chrome.storage.local.set(
      {
        name: request.payload,
      },
      () => {
        if (chrome.runtime.lastError) {
          sendResponse({ message: "fail" });
          return;
        }

        sendResponse({ message: "success", payload: request.payload });
      }
    );

    return true;
  } else if (request.message === "get_topics") {
    chrome.storage.local.get("topics", (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          message: "fail",
        });

        return;
      }

      sendResponse({
        message: "success",
        payload: data,
      });
    });

    return true;
  } else if (request.message === "add_topic") {
    //add to database
    firebase.database().ref().child("sequelize").child(request.payload).set("");
    //call fetch topics
    fetchAllTopics();
  }
});
