async function backgroundInit() {
  const data = await getStorageValue(["background", "language"]);
  let {
    background: { selected, usedIds },
    language,
  } = data;
  let syncCustomBackgrounds = data.background.customBackgrounds;

  // image backgrounds from local storage since sync storage is too small
  let localCustomBackgrounds = (
    await getStorageValue("customBackgrounds", true)
  ).customBackgrounds;

  let customBackgrounds = syncCustomBackgrounds.concat(localCustomBackgrounds);

  // randomly selected background from all selected
  let current = 0;
  resetCurrent(); // init value

  // version compatability (usedIds was added in 1.3.4)
  if (usedIds === undefined) {
    usedIds = [];
    setStorageValue({
      background: {
        selected,
        customBackgrounds: syncCustomBackgrounds,
        currentTab: current,
        usedIds,
      },
    });
  }

  // only not locally available backgrounds selected
  if (!selected.some((id) => backgroundExists(id))) {
    selected.push(0);
    setStorageValue({
      background: {
        selected,
        customBackgrounds: syncCustomBackgrounds,
        currentTab: current,
        usedIds,
      },
    });
  }

  function backgroundExists(id) {
    return (
      id < backgroundAmount || customBackgrounds.some((bg) => bg.id === id)
    );
  }

  // randomly chooses a background of the available
  function resetCurrent() {
    // only choose from locally available backgrounds
    const filteredSelected = selected.filter((id) => backgroundExists(id));
    current =
      filteredSelected[
        Math.round(Math.random() * (filteredSelected.length - 1))
      ];
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
      const background = customBackgrounds.find((bg) => bg.id === current);

      if (background) {
        const backgroundString = CSS_BACKGROUND_PREFIX + background.bg;
        background_element.style.background = backgroundString;
        // complete if background was successfully applied
        return;
      }
      // fall through if edge case that pc does not have the selected local background
    }
    // background is one of default ones
    background_element.style.background =
      CSS_BACKGROUND_PREFIX + "var(--background)";
    background_element.classList.add("background" + current);
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
    // image background is not locally available
    if (!backgroundExists(id)) return;
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
      element.style.background = CSS_BACKGROUND_PREFIX + bg.bg;
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
      background: {
        selected,
        customBackgrounds: syncCustomBackgrounds,
        currentTab: current,
        usedIds,
      },
    });

    // load just selected background
    loadBackground(id);
  }

  // handle delete event for custom backgrounds
  async function backgroundHandleDelete(id) {
    try {
      const overlayText = languages[language].overlays.backgroundConfirmDelete;
      await openOverlay({
        headerText: overlayText.title,
        buttons: [{ name: overlayText.confirm, value: undefined }],
      });

      usedIds = usedIds.filter((ele) => ele !== id);

      selected = selected.filter((ele) => ele !== id);

      if (selected.length === 0) selected = [0];
      // only not locally available backgrounds selected
      else if (!selected.some((id) => backgroundExists(id))) selected.push(0);

      const length = syncCustomBackgrounds.length;
      syncCustomBackgrounds = syncCustomBackgrounds.filter(
        (bg) => bg.id !== id
      );
      const isLocal = syncCustomBackgrounds.length === length;

      if (isLocal)
        localCustomBackgrounds = localCustomBackgrounds.filter(
          (bg) => bg.id !== id
        );

      if (id === current) resetCurrent();

      if (isLocal)
        setStorageValue({ customBackgrounds: localCustomBackgrounds }, true);

      setStorageValue({
        background: {
          selected,
          customBackgrounds: syncCustomBackgrounds,
          currentTab: current,
          usedIds,
        },
      });
    } catch (e) {
      console.log(e);
    }
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

      let bg;
      if (button !== "image") {
        [bg] = (
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
      } else {
        const input_template = document.getElementById("upload_image_template");
        const overlayPromise = openOverlay({
          headerText: overlayText.title,
          buttons: [
            {
              name: overlayText.confirm,
              value: undefined,
            },
          ],
          checkFct: () => document.querySelector(".upload_image_input").value,
          customNodes: input_template.content.cloneNode(true).children,
        });

        requestAnimationFrame(() => {
          const wrapper = document.querySelector(
            "#overlay .upload_image_wrapper"
          );
          document
            .querySelector("#overlay .upload_image_input")
            .addEventListener("change", (e) => {
              wrapper.classList.toggle("filled", e.target.files.length);
            });
        });

        // wait for confirm button
        await overlayPromise;

        const file = document.querySelector("#overlay .upload_image_input")
          .files[0];

        bg =
          "url(" +
          (await new Promise((res) => {
            const reader = new FileReader();

            reader.onloadend = () => {
              res(reader.result);
            };
            reader.readAsDataURL(file);
          })) +
          ")";
      }

      const id = getNewId();
      (button === "image"
        ? localCustomBackgrounds
        : syncCustomBackgrounds
      ).push({
        bg,
        id,
      });
      setStorageValue({
        background: {
          selected,
          customBackgrounds: syncCustomBackgrounds,
          currentTab: current,
          usedIds,
        },
      });
      setStorageValue(
        {
          customBackgrounds: localCustomBackgrounds,
        },
        true
      );
    } catch (e) {
      console.error(e);
    }
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
      (id) =>
        !backgroundIconsWrapper.querySelector(`[bgId="${id}"].selected`) &&
        backgroundExists(id)
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
    while (usedIds.some((ele) => ele === id)) {
      id++;
    }
    usedIds.push(id);
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
      background: {
        selected,
        customBackgrounds: syncCustomBackgrounds,
        currentTab: current,
        usedIds,
      },
    });
  });
  // set current when new tab is opened
  setStorageValue({
    background: {
      selected,
      customBackgrounds: syncCustomBackgrounds,
      currentTab: current,
      usedIds,
    },
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
      ({ selected, usedIds } = changes.background.newValue);
      syncCustomBackgrounds = changes.background.newValue.customBackgrounds;
      customBackgrounds = syncCustomBackgrounds.concat(localCustomBackgrounds);
      // only not locally available backgrounds selected
      if (!selected.some((id) => backgroundExists(id))) {
        selected.push(0);
        setStorageValue({
          background: {
            selected,
            customBackgrounds: syncCustomBackgrounds,
            currentTab: current,
            usedIds,
          },
        });
      }

      loadBackground();
      updateBackgroundIcons();
    }
    if (changes.customBackgrounds !== undefined) {
      localCustomBackgrounds = changes.customBackgrounds.newValue;
      customBackgrounds = syncCustomBackgrounds.concat(localCustomBackgrounds);
      loadBackground();
      updateBackgroundIcons();
    }
  });
}

backgroundInit();
