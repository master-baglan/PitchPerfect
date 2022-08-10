console.log("hello from content script");
if ("webkitSpeechRecognition" in window) {
  console.log("hello from webkit speech recognition");
  let baglan = new webkitSpeechRecognition();
  baglan.continuous = true;
  baglan.interimResults = true;
  let lang = "";

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
  let wordsToShow = 36; //should be only even number
  let half = wordsToShow / 2;

  chrome.storage.local.get(["text", "lang"], function (result) {
    console.log(result.text);
    allText = result.text;
    displayText = allText.slice(fromWord, fromWord + wordsToShow);
    displayTextPart1 = displayText.slice(0, half);
    displayTextPart2 = displayText.slice(-half);
    console.log(displayText);
    lang = result.lang;
    baglan.lang = lang;
    console.log(lang);
    newSpan.textContent = "Press to start speech...";
    newSpan2.textContent = "";
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
        displayTextPart2 = displayText.slice(-half);
        console.log(displayText);
        newSpan.textContent = "Press to start speech...";
        newSpan2.textContent = "";
      }
      if (item === "lang") {
        lang = changes[item].newValue;
        console.log(lang);
        baglan.lang = lang;
      }
    }
  });

  let elemDiv = document.createElement("div");
  let speakDiv = document.createElement("div");

  let br = document.createElement("br");
  elemDiv.className = "banner";
  elemDiv.appendChild(newSpan);
  elemDiv.appendChild(newSpan2);
  speakDiv.appendChild(speak);
  speakDiv.appendChild(speakInterim);
  elemDiv.appendChild(speakDiv);

  window.document.body.insertBefore(elemDiv, document.body.firstChild);
  //speech recognition

  elemDiv.addEventListener("click", () => {
    isListening = !isListening;
    if (isListening) {
      baglan.start();
      newSpan.textContent = displayTextPart1.toString().replaceAll(",", " ");
      newSpan2.textContent = displayTextPart2.toString().replaceAll(",", " ");
    } else {
      baglan.stop();
      console.log("rec is stopped");
      newSpan.textContent = "Press to start speech...";
      newSpan2.textContent = "";
    }
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

    if (start >= half - 1) {
      fromWord = fromWord + half;
      displayText = allText.slice(fromWord, fromWord + wordsToShow);
      displayTextPart1 = displayText.slice(0, half);
      displayTextPart2 = displayText.slice(-half);
      console.log(displayText);
      newSpan.textContent = displayTextPart1.toString().replaceAll(",", " ");
      newSpan2.textContent = displayTextPart2.toString().replaceAll(",", " ");
    }
  }

  //converts text to array of words
  function getWords(text) {
    if (lang === "en-US") {
      let x = text.replace(/[^A-Za-z0-9]+/g, " ");
      let words = x.trim().toLowerCase().split(" ");
      return words;
    } else if (lang === "ru-RU") {
      let x = text.replace(/[^А-Яа-я0-9]+/g, " ");
      let words = x.trim().split(" ");
      return words;
    } else {
      let x = text;
      let words = x.trim().split(" ");
      return words;
    }

    return words;
  }
} else {
  console.log("Speech Recognition Not Available");
}
