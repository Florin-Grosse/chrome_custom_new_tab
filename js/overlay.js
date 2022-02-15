function overlayInit() {
  const html = document.firstElementChild;
  const buttonTemplate = document.getElementById("overlay_button_template");
  const header = document.querySelector("#overlay h1");
  const buttonWrapper = document.getElementById("overlay_buttons");
  const inputWrapper = document.getElementById("overlay_inputs");

  function addEventListener() {
    // close overlay on esc press
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeOverlay();
      }
    });

    // close overlay button
    document.getElementById("close_overlay").addEventListener("click", () => {
      closeOverlay();
    });

    // close overlay on click
    document.getElementById("overlay").addEventListener("click", (e) => {
      if (e.target.id === "overlay") closeOverlay();
    });

    // overlay submit on enter
    document.addEventListener("keypress", (e) =>
      e.key === "Enter" ? closeOverlay(true) : null
    );
  }

  let confirmFunction;
  let rejectFunction;
  function openOverlay(
    /*
    {
      headerText?: string,
      buttons?: [
        {
          // button text
          name: string,
          // return value if button is pressed
          value: any
        }
      ],
      // input labels + length of inputs
      inputs?: (string | {name: string, value: string})[],
      // checks if inputs are valid
      checkFct?: (inputs: string[]) => boolean,
      // custom HTML Nodes to put in Popup
      customNodes?: Node[]
    }
    */
    content
    // returns Promise<{button: any (value of pressed button -> see buttons attribute), inputs: string[]}>
  ) {
    content = {
      ...{
        headerText: "",
        buttons: [
          {
            name: "Confirm",
            value: undefined,
          },
        ],
        inputs: [],
        checkFct: () => true,
        customNodes: [],
      },
      ...content,
    };
    html.classList.add("overlay");
    header.textContent = content.headerText;
    while (inputWrapper.lastElementChild) {
      inputWrapper.removeChild(inputWrapper.lastElementChild);
    }
    while (buttonWrapper.lastElementChild) {
      buttonWrapper.removeChild(buttonWrapper.lastElementChild);
    }
    content.inputs.forEach((input) => {
      const span = document.createElement("span");
      span.innerText = input.name || input;
      const inputEle = document.createElement("input");
      if (input.value) inputEle.value = input.value;
      inputWrapper.append(span);
      inputWrapper.append(inputEle);
    });

    content.buttons.forEach((button) => {
      const element = buttonTemplate.content.cloneNode(true).children[0];
      element.textContent = button.name;
      // submit on button click
      element.addEventListener("click", () => closeOverlay(true, button.value));
      buttonWrapper.append(element);
    });

    [...content.customNodes].forEach((node) => inputWrapper.append(node));

    if (content.inputs.length > 0)
      requestAnimationFrame(() => inputWrapper.querySelector("input").focus());

    return new Promise((resolve, reject) => {
      confirmFunction = (buttonValue) => {
        const values = [...inputWrapper.querySelectorAll("input")].map(
          (input) => input.value
        );
        if (content.checkFct(values)) {
          resolve({
            button: buttonValue,
            inputs: [...inputWrapper.querySelectorAll("input")].map(
              (input) => input.value
            ),
          });
          confirmFunction = undefined;
          return true;
        } else return false;
      };
      rejectFunction = () => {
        reject("Popup closed");
        rejectFunction = undefined;
      };
    });
  }

  function closeOverlay(success = false, value = undefined) {
    if (success) {
      if (confirmFunction && confirmFunction(value))
        html.classList.remove("overlay");
    } else if (rejectFunction) {
      html.classList.remove("overlay");
      rejectFunction();
    }
  }

  addEventListener();

  return openOverlay;
}

window.openOverlay = overlayInit();
