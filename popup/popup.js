const inputText = document.getElementById("inputText");
const saveBtn = document.getElementById("saveButton");
const displayText = document.getElementById("displayText");

chrome.storage.local.get(["text"], function (result) {
  inputText.textContent = result.text.toString().replaceAll(",", " ");
});

saveBtn.addEventListener("click", () => {
  let text = getWords(inputText.value);
  chrome.storage.local.set(
    {
      text: text,
    },
    () => {
      console.log("set to local storage");
    }
  );

  displayText.value = text;
});

//converts text to array of words
function getWords(text) {
  let x = text.replace(/[^A-Za-z0-9]+/g, " ");
  let words = x.trim().toLowerCase().split(" ");
  return words;
}
