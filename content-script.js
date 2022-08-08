console.log("hello from content script");

let isListening = false;
let newSpan = document.createElement("newSpan");
let newSpan2 = document.createElement("newSpan");
let speak = document.createElement("newSpan");
let speakInterim = document.createElement("newSpan");
speak.id = "speak-text";
speakInterim.id = "speak-text2";
newSpan.id = "newSpan";
newSpan2.id = "newSpan2";
let allText = [];
let displayText = [];
let displayTextPart1 = [];
let displayTextPart2 = [];
let fromWord = 0;
let wordsToShow = 30; //should be only even number
let half = wordsToShow / 2;

chrome.storage.local.get(["text"], function (result) {
  console.log(result.text);
  allText = result.text;
  displayText = allText.slice(fromWord, fromWord + wordsToShow);
  displayTextPart1 = displayText.slice(0, half);
  displayTextPart2 = displayText.slice(half);
  console.log(displayText);
  newSpan.textContent = displayTextPart1.toString().replaceAll(",", " ");
  newSpan2.textContent = displayTextPart1.toString().replaceAll(",", " ");
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
      displayTextPart1 = displayText.slice(0, half);
      displayTextPart2 = displayText.slice(half);
      console.log(displayText);
      newSpan.textContent = displayTextPart1.toString().replaceAll(",", " ");
      newSpan2.textContent = displayTextPart1.toString().replaceAll(",", " ");
    }
  }
});

let elemDiv = document.createElement("div");
let speakDiv = document.createElement("div");
let recBtn = document.createElement("button");
let br = document.createElement("br");
recBtn.textContent = "REC";
elemDiv.className = "banner";
elemDiv.appendChild(newSpan);
elemDiv.appendChild(newSpan2);
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
    let textArr = getWords(text);
    let start = 0;

    textArr.forEach((element) => {
      let index = displayText.indexOf(element, start);
      if (index > 0) {
        start = index;
      }
    });
    if (start >= half) {
      fromWord = fromWord + half;
      displayText = allText.slice(fromWord, fromWord + wordsToShow);
      displayTextPart1 = displayText.slice(0, half);
      displayTextPart2 = displayText.slice(half);
      console.log(displayText);
      newSpan.textContent = displayTextPart1.toString().replaceAll(",", " ");
      newSpan2.textContent = displayTextPart1.toString().replaceAll(",", " ");
    }
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
