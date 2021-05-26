function overlayInit() {
  const html = document.firstElementChild;
  const button = document.getElementById("overlay_button");
  const header = document.querySelector("#overlay h1");
  const wrapper = document.getElementById("overlay_inputs");

  function addEventListener() {
    // close overlay on esc press
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeOverlay();
      }
    });

    // close overlay button
    document
      .getElementById("close_overlay_svg")
      .addEventListener("click", () => {
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

    // submit on button click
    button.addEventListener("click", () => closeOverlay(true));
  }

  let confirmFunction;
  let rejectFunction;
  function openOverlay(
    headerText,
    buttonText,
    inputs = [],
    checkFct = () => true
  ) {
    html.classList.add("overlay");
    header.innerHTML = headerText;
    button.innerHTML = buttonText;
    wrapper.innerHTML = "";
    wrapper.innerHTML = inputs
      .map(
        (input) =>
          `<span>${input.name || input}</span><input ${
            input.value ? `value="${input.value}"` : ""
          } />`
      )
      .join("");
    if (inputs.length > 0)
      requestAnimationFrame(() => wrapper.querySelector("input").focus());
    return new Promise((resolve, reject) => {
      confirmFunction = () => {
        const values = [...wrapper.querySelectorAll("input")].map(
          (input) => input.value
        );
        if (checkFct(values)) {
          resolve(
            [...wrapper.querySelectorAll("input")].map((input) => input.value)
          );
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

  function closeOverlay(success = false) {
    if (success) {
      if (confirmFunction && confirmFunction())
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
