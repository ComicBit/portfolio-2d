export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");

  //as a default, the dialogue box is hidden, with this command it will become visible when we call the function
  dialogueUI.style.display = "block";

  //This will make the text appear letter by letter
  let index = 0;
  let currentText = "";
  const intervalRef = setInterval(() => {
    if (index === text.length) {
      currentText += text[index];
      //innerHTML is not recommended to use because you could be victim of XSS attacks, here we are fine because we don't accept user inputs, but definitely not a best practice. We are using it becauase we'll have links and other html elements in the text
      dialogue.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(intervalRef);
  }, 5);

  const closeBtn = document.getElementById("close");

  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }

  closeBtn.addEventListener("click", onCloseBtnClick);
}
