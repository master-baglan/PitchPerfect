const inputText = document.getElementById("inputText");
const saveBtn = document.getElementById("saveButton");
const displayText = document.getElementById("displayText");
const language = document.getElementById("lang");

chrome.storage.local.get(["text", "lang"], function (result) {
  inputText.textContent = result.text.toString().replaceAll(",", " ");
  language.value = result.lang;
});

saveBtn.addEventListener("click", () => {
  let text = getWords(inputText.value);
  chrome.storage.local.set(
    {
      text: text,
      lang: language.value,
    },
    () => {
      console.log("set to local storage");
      console.log("language: " + language.value);
    }
  );

  displayText.value = text;
});

//converts text to array of words
function getWords(text) {
  if (language.value === "en-US") {
    let x = text.replace(/[^A-Za-z0-9]+/g, " ");
    let words = x.trim().toLowerCase().split(" ");
    return words;
  } else if (language.value === "ru-RU") {
    let x = text.replace(/[^А-Яа-я0-9]+/g, " ");
    let words = x.trim().split(" ");
    console.log("hi master");
    return words;
  } else {
    let x = text;
    let words = x.trim().split(" ");
    return words;
  }

  return words;
}
