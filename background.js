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
  appId: "1:1041375254209:web:6c9ad1031bbebfd0bf6640"
};

firebase.initializeApp(firebaseConfig);



async function getTab (info) {
  try {
    console.log(info, 'in get')
    let tabInfo = await chrome.tabs.get(info)
    console.log(tabInfo)
    const url = tabInfo.url
    if(!url.includes('sequelize.org')){
      chrome.action.setPopup({popup: 'deniedPopup.html'})
    } else {
      chrome.action.setPopup({popup: 'popup.html'})
    }
  } catch (error) {
    console.error(error)
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(tabId, 'hit in onUpdate')
  getTab(tabId)
})



chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(activeInfo, 'in active infor')
  setTimeout(function() {
    getTab(activeInfo.tabId);
  }, 100)

})


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
