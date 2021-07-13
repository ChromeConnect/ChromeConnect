let changeNameButton = document.getElementById("changeNameButton");
let displayNameText = document.getElementById("displayNameText");
let nameInput = document.getElementById("nameInput");
let unorderedList = document.getElementById("unorderedList");
let addTopicButton = document.getElementById("addTopicButton");
let topicInput = document.getElementById("topicInput");
let searchTopicInput = document.getElementById("searchTopicInput");
let searchTopicButton = document.getElementById("searchTopicButton");
let viewMyTopicsButton = document.getElementById("viewMyTopicsButton");

viewMyTopicsButton.addEventListener("click", function () {
  if (viewMyTopicsButton.innerText !== "Go Back") {
    viewMyTopicsButton.innerText = "Go Back";
    chrome.runtime.sendMessage(
      {
        message: "get_my_topics",
      },
      (response) => {
        if (response.message === "success") {
          //console.log(response.payload); //["new", "other"]
          unorderedList.innerHTML = "";
          let arrayOfTopics = response.payload;
          for (let i = 0; i < 10; i++) {
            if (arrayOfTopics[i]) {
              let listItemElement = document.createElement("li");
              let deleteButton = document.createElement("icon");
              listItemElement.textContent = arrayOfTopics[i];
              listItemElement.addEventListener("click", function () {
                chrome.storage.local.get("name", (data) => {
                  window.open(
                    `https://chromechat.herokuapp.com/${
                      data.name
                    }+${replaceSpaces(this.innerText)}`,
                    // `http://localhost:8080/${data.name}+${replaceSpaces(
                    // 	this.innerText
                    // )}`,
                    "popUpWindow",
                    "height=300,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=no, status=yes"
                  );
                });
              });
              deleteButton.className = "far fa-trash-alt";
              deleteButton.addEventListener("click", function () {
                //prevent chat window from opening
                window.close();

                const parentListItemText = deleteButton.parentElement.innerText;
                const topicToDelete = parentListItemText.substring(
                  0,
                  parentListItemText.length
                );
                //send message to backend to delete from firebase and reset local storage
                chrome.runtime.sendMessage({
                  message: "delete_topic",
                  payload: topicToDelete,
                });
                //tell user deletion was successful
                alert(
                  `Are you sure you want to delete ${topicToDelete}? Press OK to confirm.`
                );
              });
              listItemElement.appendChild(deleteButton);
              unorderedList.appendChild(listItemElement);
            }
          }
        }
      }
    );
  } else {
    viewMyTopicsButton.innerText = "View My Topics";
    unorderedList.innerHTML = "";
    chrome.runtime.sendMessage(
      {
        message: "get_topics",
      },
      (response) => {
        if (response.message === "success") {
          let topicsObject = response.payload.topics;
          let arrayOfTopics = Object.keys(topicsObject).reverse();
          for (let i = 0; i < 10; i++) {
            if (arrayOfTopics[i]) {
              let listItemElement = document.createElement("li");
              listItemElement.addEventListener("click", function () {
                //get name from local storage
                chrome.storage.local.get("name", (data) => {
                  window.open(
                    `https://chromechat.herokuapp.com/${
                      data.name
                    }+${replaceSpaces(this.innerText)}`,
                    // `http://localhost:8080/${data.name}+${replaceSpaces(
                    // 	this.innerText
                    // )}`,
                    "popUpWindow",
                    "height=700,width=800,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=no, status=yes"
                  );
                });
              });
              if (i === 0) {
                listItemElement.appendChild(document.createTextNode("Lobby"));
              } else {
                listItemElement.appendChild(
                  document.createTextNode(arrayOfTopics[i])
                );
              }
              unorderedList.appendChild(listItemElement);
            }
          }
        }
      }
    );
  }
});

searchTopicButton.addEventListener("click", function () {
  chrome.runtime.sendMessage(
    {
      message: "search_topic",
      payload: searchTopicInput.value,
    },
    (response) => {
      if (response.message === "success") {
        //dont forget to erase already shown topics, then display with results
        unorderedList.innerHTML = "";
        //display search results here
        let arrayOfTopics = response.payload;
        for (let i = 0; i < 10; i++) {
          if (arrayOfTopics[i]) {
            let listItemElement = document.createElement("li");
            listItemElement.addEventListener("click", function () {
              chrome.storage.local.get("name", (data) => {
                window.open(
                  `https://chromechat.herokuapp.com/${
                    data.name
                  }+${replaceSpaces(this.innerText)}`,
                  // `http://localhost:8080/${data.name}+${replaceSpaces(
                  // 	this.innerText
                  // )}`,
                  "popUpWindow",
                  "height=800,width=900,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=no, status=yes"
                );
              });
            });
            listItemElement.appendChild(
              document.createTextNode(arrayOfTopics[i])
            );
            unorderedList.appendChild(listItemElement);
          }
        }
      }
    }
  );
  searchTopicInput.value = "";
});

chrome.runtime.sendMessage(
  {
    message: "get_name",
  },
  (response) => {
    if (response.message === "success") {
      displayNameText.innerText = `Name: ${response.payload}`;
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
        displayNameText.innerText = `Name: ${response.payload}`;
      }
    }
  );
  nameInput.value = "";
});

addTopicButton.addEventListener("click", function () {
  chrome.runtime.sendMessage({
    message: "add_topic",
    payload: topicInput.value,
  });
  chrome.storage.local.get("name", (data) => {
    let tabTopic = topicInput.value;
    topicInput.value = "";
    window.open(
      //"https://chromechat.herokuapp.com/",
      `https://chromechat.herokuapp.com/${data.name}+${replaceSpaces(
        tabTopic
      )}`,
      "popUpWindow",
      "height=800,width=900,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=no, status=yes"
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
      let arrayOfTopics = Object.keys(topicsObject).reverse();
      for (let i = 0; i < 10; i++) {
        if (arrayOfTopics[i]) {
          let listItemElement = document.createElement("li");
          listItemElement.addEventListener("click", function () {
            //get name from local storage
            chrome.storage.local.get("name", (data) => {
              window.open(
                //"https://chromechat.herokuapp.com/",
                `https://chromechat.herokuapp.com/${data.name}+${replaceSpaces(
                  this.innerText
                )}`,
                "popUpWindow",
                "height=700,width=875,right=500,top=100,resizable=yes,scrollbars=yes,toolbar=no,menubar=yes,location=no,directories=no, status=yes"
              );
            });
          });
          if (i === 0) {
            listItemElement.appendChild(document.createTextNode("Lobby"));
          } else {
            listItemElement.appendChild(
              document.createTextNode(arrayOfTopics[i])
            );
          }
          unorderedList.appendChild(listItemElement);
        }
      }
    }
  }
);

function replaceSpaces(topicString) {
  return topicString.split(" ").join("-");
}
