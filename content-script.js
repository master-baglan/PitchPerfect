console.log("hello from content script");

let isListening = false;
let newSpan = document.createElement("newSpan");
let speak = document.createElement("newSpan");
let speakInterim = document.createElement("newSpan");
speak.id = "speak-text";
speakInterim.id = "speak-text2";
newSpan.id = "newSpan";
let allText = [];
let displayText = [];
let fromWord = 0;
let wordsToShow = 30;

chrome.storage.local.get(["text"], function (result) {
  console.log(result.text);
  allText = result.text;
  isListening = result.isListening;
  displayText = allText.slice(fromWord, fromWord + wordsToShow);
  console.log(displayText);
  newSpan.textContent = displayText.toString().replaceAll(",", " ");
});
chrome.storage.onChanged.addListener((changes, area) => {
  console.log("Change in storage area: " + area);
  let changedItems = Object.keys(changes);
  for (let item of changedItems) {
    console.log(item + " has changed:");
    console.log("Old value: ");
    console.log(changes[item].oldValue);
    console.log("New value: ");
    console.log(changes[item].newValue);
    if (item === "text") {
      allText = changes[item].newValue;
      displayText = allText.slice(fromWord, fromWord + wordsToShow);
      console.log(displayText);
      newSpan.textContent = displayText.toString().replaceAll(",", " ");
    }
  }
});

let elemDiv = document.createElement("div");
let speakDiv = document.createElement("div");
let recBtn = document.createElement("button");
recBtn.textContent = "REC";
elemDiv.className = "banner";
elemDiv.appendChild(newSpan);
speakDiv.appendChild(speak);
speakDiv.appendChild(speakInterim);
elemDiv.appendChild(speakDiv);
elemDiv.appendChild(recBtn);

window.document.body.insertBefore(elemDiv, document.body.firstChild);
//speech recognition
if ("webkitSpeechRecognition" in window) {
  console.log("hello from webkit speech recognition");
  let baglan = new webkitSpeechRecognition();
  baglan.continuous = true;
  baglan.interimResults = true;

  baglan.lang = "en-US";

  recBtn.addEventListener("click", () => {
    if (isListening) {
      recBtn.textContent = "PAUSE";
      baglan.start();
    } else {
      recBtn.textContent = "REC";
      baglan.stop();
      console.log("rec is stopped");
    }
    isListening = !isListening;
  });

  baglan.onstart = () => {
    console.log("rec is on");
  };

  baglan.onerror = (event) => {
    if (event.error === "not-allowed") {
      console.log("some error happened");
    }
  };

  baglan.onresult = (event) => {
    let final_transcript = "";
    let interim_transcript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    speakInterim.textContent = interim_transcript;
    speak.textContent = final_transcript;
    moveText(final_transcript);
  };

  function moveText(text) {
    if (text.includes("next")) {
      console.log("next word triggerd");
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    }
    let textArr = getWords(text);
    let start = 0;

    textArr.forEach((element) => {
      let index = displayText.indexOf(element, start);
      if (index > 0) {
        start = index;
      }
    });
    fromWord = fromWord + start;
    displayText = allText.slice(fromWord, fromWord + wordsToShow);
    console.log(displayText);
    newSpan.textContent = displayText.toString().replaceAll(",", " ");
  }

  //converts text to array of words
  function getWords(text) {
    let x = text.replace(/[^A-Za-z0-9]+/g, " ");
    let words = x.trim().toLowerCase().split(" ");
    return words;
  }
} else {
  console.log("Speech Recognition Not Available");
}
