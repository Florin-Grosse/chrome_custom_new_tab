async function backgroundInit() {
  const cssBackgroundPrefix = "center center / cover ";
  let {
    background: { customBackgrounds, selected },
    language,
  } = await getStorageValue(["background", "language"]);

  // randomly selected background from all selected
  let current = 0;
  resetCurrent(); // init value

  // randomly chooses a background of the available
  function resetCurrent() {
    current = selected[Math.round(Math.random() * (selected.length - 1))];
  }

  const background_element = document.getElementById("background");
  // changes background
  // if id is defined current is set
  // otherwise "current" is applied as background
  function loadBackground(id) {
    if (id !== undefined) current = id;

    if (!selected.includes(current)) {
      if (current < backgroundAmount)
        background_element.classList.remove("background" + current);

      resetCurrent();
    }

    background_element.classList.remove(...background_element.classList);

    if (current >= backgroundAmount) {
      // custom background selected
      background_element.style.background =
        cssBackgroundPrefix +
        customBackgrounds.find((bg) => bg.id === current).bg;
    } else {
      // background is one of default ones
      background_element.style.background =
        cssBackgroundPrefix + "var(--background)";
      background_element.classList.add("background" + current);
    }
  }

  const settings = document.getElementById("settings");
  const backgroundIconsWrapper = document.getElementById("background_options");
  const backgroundTemplate = document.getElementById(
    "background_option_template"
  );
  const customBackgroundTemplate = document.getElementById(
    "custom_background_option_template"
  );
  const addBackground = document.querySelector(".add_background");

  // creates a new element for the background id of index
  // mounts it at the end of the background_options
  function createBackgroundIcon(id) {
    const element = (
      id < backgroundAmount ? backgroundTemplate : customBackgroundTemplate
    ).content.cloneNode(true).children[0];
    if (selected.includes(id)) element.classList.add("selected");
    element.setAttribute("bgId", id);
    element.addEventListener("click", () => backgroundHandleSelect(id));

    // default gradient
    if (id < backgroundAmount) {
      element.classList.add("background" + id);
    } else {
      const bg = customBackgrounds.find((bg) => bg.id === id);
      element.style.background = cssBackgroundPrefix + bg.bg;
      element.querySelector(".deleteSvg").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        backgroundHandleDelete(id, element);
      });
    }
    backgroundIconsWrapper.insertBefore(element, addBackground);
  }

  // intially mmount all background icons
  function initBackgroundIcons() {
    // default background/gradients
    Array.from({
      length: backgroundAmount,
    }).map((_, index) => {
      createBackgroundIcon(index);
    });

    // custom (user added) backgrounds
    customBackgrounds.map((bg) => {
      createBackgroundIcon(bg.id);
    });

    addBackground.onclick = backgroundHandleAdd;
  }

  // handle click event on background icon
  async function backgroundHandleSelect(id) {
    if (selected.includes(id)) {
      selected = selected.filter((ele) => ele !== id);

      if (id === current) resetCurrent();

      if (selected.length === 0) selected = [0];
      // add id to selected
    } else {
      selected.push(id);
      current = id;
    }

    await setStorageValue({
      background: { selected, customBackgrounds, currentTab: current },
    });

    // load just selected background
    loadBackground(id);
  }

  // handle delete event for custom backgrounds
  async function backgroundHandleDelete(id, element) {
    try {
      const overlayText = languages[language].overlays.backgroundConfirmDelete;
      await openOverlay({
        headerText: overlayText.title,
        buttons: [{ name: overlayText.confirm, value: undefined }],
      });
      selected = selected.filter((ele) => ele !== id);
      customBackgrounds = customBackgrounds.filter((bg) => bg.id !== id);

      if (id === current) resetCurrent();

      setStorageValue({
        background: {
          selected,
          customBackgrounds,
          currentTab: current,
        },
      });
    } catch (_) {}
  }

  // handle add event for background icons
  async function backgroundHandleAdd() {
    try {
      let overlayText = languages[language].overlays.backgroundAddOptions;
      const { button } = await openOverlay({
        headerText: overlayText.title,
        buttons: [
          {
            name: overlayText.image,
            value: "image",
          },
          {
            name: overlayText.gradient,
            value: "gradient",
          },
          {
            name: overlayText.color,
            value: "color",
          },
        ],
      });

      // get new text for overlay
      switch (button) {
        case "image":
          overlayText = languages[language].overlays.backgroundAddImage;
          break;
        case "gradient":
          overlayText = languages[language].overlays.backgroundAddGradient;
          break;
        case "color":
          overlayText = languages[language].overlays.backgroundAddColor;
          break;
      }

      let [bg] = (
        await openOverlay({
          headerText: overlayText.title,
          buttons: [{ name: overlayText.confirm, value: undefined }],
          inputs: [""],
          checkFct: (val) => val[0],
        })
      ).inputs;

      // manipulate strings according to background type
      switch (button) {
        case "image":
          bg = 'url("' + bg + '")';
          break;
        case "gradient":
          break;
        case "color":
          if (!bg.startsWith("#")) bg = "#" + bg;
          break;
      }

      const id = getNewId();
      customBackgrounds.push({ bg, id });
      setStorageValue({
        background: { selected, customBackgrounds, currentTab: current },
      });
    } catch (_) {}
  }

  // update background icons to changes made on other new tab
  // only make updates, don't touch not changed elements
  function updateBackgroundIcons() {
    const addedBgs = customBackgrounds.filter(
      (bg) => !backgroundIconsWrapper.querySelector(`[bgId="${bg.id}"]`)
    );
    const removedBgs = [
      ...backgroundIconsWrapper.querySelectorAll(
        ".background_option:not(.add_background)"
      ),
    ].filter((ele) => {
      const id = Number(ele.getAttribute("bgId"));
      return (
        id >= backgroundAmount && !customBackgrounds.some((bg) => bg.id === id)
      );
    });

    const addedSelected = selected.filter(
      (id) => !backgroundIconsWrapper.querySelector(`[bgId="${id}"].selected`)
    );
    const removedSelected = [
      ...backgroundIconsWrapper.querySelectorAll(`.background_option.selected`),
    ].filter((ele) => !selected.includes(Number(ele.getAttribute("bgId"))));

    // create newly added bg icons
    addedBgs.forEach((bg) => createBackgroundIcon(bg.id));

    // remove removed backgrounds
    removedBgs.forEach((ele) => {
      ele.remove();
    });

    // select newly selected backgrounds
    addedSelected.forEach((id) => {
      const ele = backgroundIconsWrapper.querySelector(`[bgId="${id}"]`);
      if (ele) ele.classList.add("selected");
    });

    // deselect newly deselected backgrounds
    removedSelected.forEach((ele) => {
      ele.classList.remove("selected");
    });
  }

  // get an id that is not yet used by another custom background
  function getNewId() {
    let id = backgroundAmount;
    while (customBackgrounds.some((bg) => bg.id === id)) {
      id++;
    }
    return id;
  }

  function closeSettings() {
    settings.classList.remove("open");
  }

  // close overlay when pressing escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSettings();
    }
  });

  // fixes issues with eventListener not firing
  window.focus();
  // set global var to current bg when tab is focused
  window.addEventListener("focus", () => {
    setStorageValue({
      background: { selected, customBackgrounds, currentTab: current },
    });
  });
  // set current when new tab is opened
  setStorageValue({
    background: { selected, customBackgrounds, currentTab: current },
  });

  // add settings eventListener
  settings.addEventListener("click", (e) => {
    if (e.target.id === "settings" || e.target.parentElement.id === "settings")
      settings.classList.toggle("open");
  });

  document
    .getElementById("close_backgrounds")
    .addEventListener("click", closeSettings);

  // add transiton later to prevent element from showing when page loads (only on browser start)
  requestAnimationFrame(() => {
    document.getElementById("background_options_wrapper").style.transition =
      "opacity .25s ease-in-out";
  });

  loadBackground();
  initBackgroundIcons();

  // global change listener
  changeListener.push((changes) => {
    if (changes.background !== undefined) {
      ({ customBackgrounds, selected } = changes.background.newValue);
      loadBackground();
      updateBackgroundIcons();
    }
  });
}

backgroundInit();
