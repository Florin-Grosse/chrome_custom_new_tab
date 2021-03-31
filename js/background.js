async function backgroundInit() {
  let { customBackgrounds, selected } = {};
  try {
    ({ customBackgrounds, selected } = (
      await getStorageValue(["background"])
    ).background);
  } catch (err) {
    chrome.storage.sync.set({
      background: { customBackgrounds: [], selected: [0] },
    });
    customBackgrounds = [];
    selected = [0];
  }

  const current = selected[Math.round(Math.random() * (selected.length - 1))];

  const background_element = document.getElementById("background");
  function loadBackground(oldValues = []) {
    oldValues.forEach((oldVal) => {
      if (oldVal >= gradientAmount) return;

      background_element.classList.remove("gradient" + oldVal);
    });

    if (current >= gradientAmount) {
      background_element.style.background = customBackgrounds.find(
        (bg) => bg.id === current
      ).bg;
    } else {
      background_element.style.background = "var(--background)";
      background_element.classList.add("gradient" + current);
    }
  }

  const settings = document.getElementById("settings");
  const gradientIcons = document.getElementById("gradient_options");
  function loadSettings() {
    const gradientIconsHTML = Array.from(
      { length: gradientAmount },
      (x, i) => i
    )
      .map(
        (index) =>
          '<div class="gradient' +
          index +
          " gradient_option" +
          (selected.includes(index) ? " selected" : "") +
          '" bgId="' +
          index +
          '">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="selectedSvg"><path d="M9 16.2l-3.5-3.5c-.39-.39-1.01-.39-1.4 0-.39.39-.39 1.01 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7c.39-.39.39-1.01 0-1.4-.39-.39-1.01-.39-1.4 0L9 16.2z"/></svg>' +
          "</div>"
      )
      .join("");

    const customBackgroundsHTML = customBackgrounds
      .map(
        (bg) =>
          '<div class="gradient_option' +
          (selected.includes(bg.id) ? " selected" : "") +
          '" style="background: ' +
          bg.bg +
          '" bgId="' +
          bg.id +
          '">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="selectedSvg"><path d="M9 16.2l-3.5-3.5c-.39-.39-1.01-.39-1.4 0-.39.39-.39 1.01 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7c.39-.39.39-1.01 0-1.4-.39-.39-1.01-.39-1.4 0L9 16.2z"/></svg>' +
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="deleteSvg"><path d="m15.5 4-0.71-0.71c-0.18-0.18-0.44-0.29-0.7-0.29h-4.18c-0.26 0-0.52 0.11-0.7 0.29l-0.71 0.71h-2.5c-0.55 0-1 0.45-1 1s0.45 1 1 1h12c0.55 0 1-0.45 1-1s-0.45-1-1-1z"/><path d="m6 19c0 1.1 0.9 2 2 2h8c1.1 0 2-0.9 2-2v-10c0-1.1-0.9-2-2-2h-8c-1.1 0-2 0.9-2 2zm3.17-7.83c0.39-0.39 1.02-0.39 1.41 0l1.42 1.42 1.42-1.42c0.39-0.39 1.02-0.39 1.41 0s0.39 1.02 0 1.41l-1.42 1.42 1.42 1.42c0.39 0.39 0.39 1.02 0 1.41s-1.02 0.39-1.41 0l-1.42-1.42-1.42 1.42c-0.39 0.39-1.02 0.39-1.41 0s-0.39-1.02 0-1.41l1.42-1.42-1.42-1.42c-0.39-0.38-0.39-1.02 0-1.41z"/></svg>' +
          "</div>"
      )
      .join("");

    gradientIcons.innerHTML =
      gradientIconsHTML +
      customBackgroundsHTML +
      '<div class="gradient_option add_background"><svg version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="var(--font-color)"><path d="m196.32 66.641c-11.121 1.523-20.336 10.124-22.564 21.061-0.595 2.915-0.629 5.436-0.633 45.856l-3e-3 39.558-83.6 0.091-1.6 0.366c-14.938 3.413-24.046 17.618-20.689 32.267 2.3 10.036 10.618 18.097 20.791 20.149 2.689 0.542 4.748 0.568 44.973 0.57l40.115 1e-3 0.11 82.64 0.344 1.76c3.922 20.053 26.608 28.866 42.711 16.593 5.881-4.482 9.61-11.346 10.28-18.925 0.104-1.172 0.163-16.221 0.164-41.945l1e-3 -40.116 82.8-0.102 1.84-0.356c18.452-3.572 27.69-24.026 18.113-40.109-3.707-6.226-10.064-10.727-17.57-12.439l-1.583-0.361-83.6-0.084v-40.381c0-40.733-0.018-42.1-0.577-44.895-2.746-13.713-15.951-23.099-29.823-21.199" fill-rule="evenodd"/></svg></div>' +
      Array.from({ length: 16 }, (x, i) => i)
        .map(() => `<div class="gradient_option_filler"></div>`)
        .join("");

    // add eventListener to gradientIcons
    document
      .querySelectorAll(".gradient_option:not(.add_background)")
      .forEach((ele) => {
        ele.addEventListener("click", () => {
          const bgId = Number(ele.getAttribute("bgId"));
          if (selected.includes(bgId))
            selected = selected.filter((ele) => ele !== bgId);
          else selected.push(bgId);
          chrome.storage.sync.set({
            background: { selected, customBackgrounds },
          });
        });
        const deleteSvg = ele.querySelector(".deleteSvg");
        if (deleteSvg)
          deleteSvg.addEventListener("click", () => {
            const id = Number(ele.getAttribute("bgId"));
            selected = selected.filter((ele) => ele !== id);
            html.classList.add(JSON.stringify(selected));
            customBackgrounds = customBackgrounds.filter((bg) => bg.id !== id);
            console.log(selected, { selected, customBackgrounds });
            setStorageValue({ selected, customBackgrounds });
          });
      });

    document
      .querySelector(".gradient_option.add_background")
      .addEventListener("click", () => {
        openOverlay(
          () => {
            if (url.value === "") return;
            customBackgrounds.push({ bg: url.value, id: getNewId() });
            chrome.storage.sync.set({
              background: { selected, customBackgrounds },
            });
            closeOverlay();
          },
          "Apply",
          "Add Background",
          false,
          false
        );
      });

    document
      .querySelector("#settings>svg")
      .addEventListener("click", () =>
        settings.classList.contains("open")
          ? settings.classList.remove("open")
          : settings.classList.add("open")
      );
  }

  // get an id that is not yet used by another custom background
  function getNewId() {
    let id = gradientAmount;
    while (customBackgrounds.some((bg) => bg.id === id)) {
      id++;
    }
    return id;
  }

  function closeSettings() {
    settings.classList.remove("open");
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeOverlay();
      closeSettings();
    }
  });

  loadBackground();
  loadSettings();

  // global change listener
  changeListener.push((changes) => {
    if (changes.background !== undefined) {
      ({ customBackgrounds, selected } = changes.background.newValue);
      loadBackground(changes.background.oldValue.selected);
      loadSettings();
    }
  });
}

backgroundInit();
