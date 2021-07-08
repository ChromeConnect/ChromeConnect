let changeNameButton = document.getElementById("changeNameButton");
let displayNameText = document.getElementById("displayNameText");
let nameInput = document.getElementById("nameInput");
let unorderedList = document.getElementById("unorderedList");
let addTopicButton = document.getElementById("addTopicButton");
let topicInput = document.getElementById("topicInput");



let currentTab
chrome.tabs.query({active: true, currentWindow: true},async function(tabs){   
	currentTab = tabs[0].url;
  console.log(currentTab)
  if(!currentTab.includes('sequelize.org')){
    chrome.action.setPopup({popup: 'deniedPopup.html'})
  } else {
    chrome.action.setPopup({popup: 'popup.html'})
  }
});

// chrome.runtime.sendMessage(
//   {
//     payload: currentTab,
//     message: 'getUrl'
//   },
//   (respone) => {
//     if(respone.message =='success') {
//       console.log(response.payload)
//     }
//   }
// )



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
  chrome.storage.local.get("name", (data) => {
    window.open(
      //"https://chromechat.herokuapp.com/",
      `http://localhost:8080/${data.name}+${replaceSpaces(topicInput.value)}`,
      "popUpWindow",
      "height=300,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=no, status=yes"
    );
  });
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
          //get name from local storage
          chrome.storage.local.get("name", (data) => {
            window.open(
              //"https://chromechat.herokuapp.com/",
              `http://localhost:8080/${data.name}+${replaceSpaces(
                this.innerText
              )}`,
              "popUpWindow",
              "height=300,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=no, status=yes"
            );
          });
        });
        listItemElement.appendChild(document.createTextNode(key));
        unorderedList.appendChild(listItemElement);
      }
    }
  }
);

function replaceSpaces(topicString) {
  return topicString.split(" ").join("-");
}
