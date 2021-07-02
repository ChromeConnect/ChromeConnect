let changeNameButton = document.getElementById("changeNameButton");
let displayNameText = document.getElementById("displayNameText");
let nameInput = document.getElementById("nameInput");
let unorderedList = document.getElementById("unorderedList");
let addTopicButton = document.getElementById("addTopicButton");
let topicInput = document.getElementById("topicInput");

chrome.runtime.sendMessage(
  {
    message: "get_name",
  },
  (response) => {
    if (response.message === "success") {
      displayNameText.innerHTML = `Name: "${response.payload}"`;
    }
  }
);

changeNameButton.addEventListener("click", function () {
  chrome.runtime.sendMessage(
    {
      message: "change_name",
      payload: nameInput.value,
    },
    (response) => {
      if (response.message === "success") {
        displayNameText.innerHTML = `Name: "${response.payload}"`;
      }
    }
  );
});

addTopicButton.addEventListener("click", function () {
  chrome.runtime.sendMessage({
    message: "add_topic",
    payload: topicInput.value,
  });
  window.open("https://www.nba.com/");
});

//fetch topics from local storage every time popup is opened
chrome.runtime.sendMessage(
  {
    message: "get_topics",
  },
  (response) => {
    if (response.message === "success") {
      let topicsObject = response.payload.topics;
      for (key in topicsObject) {
        let listItemElement = document.createElement("li");
        listItemElement.addEventListener("click", function () {
          window.open("https://www.nba.com/");
        });
        listItemElement.appendChild(document.createTextNode(key));
        unorderedList.appendChild(listItemElement);
      }
    }
  }
);
