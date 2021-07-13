//fetch all topics and store into local storage as soon as background is injected
//const deniedPopup = require("./deniedPopup")

var db = null;
self.importScripts("firebase/app.js", "firebase/realtimedatabase.js");
firebaseConfig = {
  apiKey: "AIzaSyC6w00fztqJTzRhsSdDUi1v1-TeT56pp9k",
  authDomain: "chromeconnect-e693c.firebaseapp.com",
  databaseURL: "https://chromeconnect-e693c-default-rtdb.firebaseio.com",
  projectId: "chromeconnect-e693c",
  storageBucket: "chromeconnect-e693c.appspot.com",
  messagingSenderId: "1041375254209",
  appId: "1:1041375254209:web:6c9ad1031bbebfd0bf6640",
};

firebase.initializeApp(firebaseConfig);

async function getTab(info) {
  try {
    let tabInfo = await chrome.tabs.get(info);
    const url = tabInfo.url;
    if (!url.includes("sequelize.org")) {
      chrome.action.setPopup({ popup: "deniedPopup.html" });
    } 
    if(url.includes("sequelize.org") || url.includes("chromechat")) {
      chrome.action.setPopup({ popup: "popup.html" });
    }
  } catch (error) {
    console.error(error);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  getTab(tabId);
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  setTimeout(function () {
    getTab(activeInfo.tabId);
  }, 100);
});

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
    name: `randomUser${Math.floor(Math.random() * 1000)}`,
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
  } else if (request.message === "delete_topic") {
    firebase
      .database()
      .ref()
      .child("sequelize")
      .child(request.payload)
      .remove();
    //call fetch topics to reset local storage
    fetchAllTopics();
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
  } else if (request.message === "search_topic") {
    chrome.storage.local.get("topics", (data) => {
      if (chrome.runtime.lastError) {
        sendResponse({
          message: "fail",
        });

        return;
      }
      //filter object and send back results
      const topicsArray = Object.keys(data.topics);
      const results = topicsArray.filter((topic) => {
        return topic.includes(request.payload);
      });
      sendResponse({
        message: "success",
        payload: results,
      });
    });
    return true;
  } else if (request.message === "add_topic") {
    chrome.identity.getProfileUserInfo((userInfo) => {
      let email = userInfo.email.toString().slice(0, -10);
      //add to database
      firebase
        .database()
        .ref()
        .child("sequelize")
        .child(request.payload)
        .child("creator")
        .set(email);
      //call fetch topics
      fetchAllTopics();
    });
  } else if (request.message === "get_my_topics") {
    chrome.identity.getProfileUserInfo((userInfo) => {
      let email = userInfo.email.toString().slice(0, -10);
      firebase
        .database()
        .ref()
        .child("sequelize")
        .get()
        .then((snapshot) => {
          if (snapshot.exists()) {
            /*
            snapshot.val()
          {
            new: {creator: "devpablolopez"}
            other: {creator: "devpablolopez"}
            topicA: {creator: "default"}
            topicB: {creator: "default"}
          }
        */
            let data = snapshot.val();
            let arrayOfTopics = Object.keys(data).filter(function (topic) {
              return email === data[topic].creator;
            });
            sendResponse({
              message: "success",
              payload: arrayOfTopics,
            });
          } else {
            console.log("No data available");
          }
        });
    });
    return true;
  }
});
