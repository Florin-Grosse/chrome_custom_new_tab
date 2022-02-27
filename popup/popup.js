async function popupInit() {
  const checkbox_template = document.getElementById("checkbox_template");
  const multiple_choice_item_template = document.getElementById(
    "multiple_choice_item_template"
  );

  function loadCheckboxInputs() {
    document.querySelectorAll(".checkbox_input").forEach(async (checkbox) => {
      //  fill with html
      const elements = checkbox_template.content.cloneNode(true).children;
      Array.from({ length: elements.length }).forEach(() => {
        checkbox.appendChild(elements[0]);
      });
      checkbox.querySelector("span").textContent =
        checkbox.getAttribute("name");

      // return if this checkbox is set to manual
      const id = checkbox.getAttribute("data-id");
      if (checkbox.hasAttribute("manual") || id === null) return;
      // get id of data
      let status = (await getStorageValue(id))[id];
      // set default value
      if (status !== true && status !== false)
        status = checkbox.getAttribute("data-default") === "true";

      // apply initial status
      if (status) checkbox.classList.add("checked");
      else checkbox.classList.remove("checked");

      // add eventListener
      checkbox.addEventListener("click", () => {
        status = !status;
        checkbox.classList.toggle("checked", status);
        setStorageValue({ [id]: status });
      });
    });
  }

  function loadMultipleChoiceInputs() {
    document.querySelectorAll(".multiple_choice").forEach(async (root) => {
      const id = root.getAttribute("data-id");
      if (root.hasAttribute("manual") || id === null) return;

      let status = (await getStorageValue(id))[id];

      if (status === undefined) {
        status = root.getAttribute("data-default");
      }

      multiple_choices[root.getAttribute("data-src")].forEach((data) => {
        const ele =
          multiple_choice_item_template.content.cloneNode(true).children[0];
        ele.setAttribute("value", data.id);
        ele.querySelector("span").textContent = data.name;
        root.appendChild(ele);
      });

      //load initial state
      root.querySelector("[value='" + status + "']").classList.add("checked");

      const checkboxes = root.querySelectorAll(".checkbox_input");
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("click", () => {
          checkboxes.forEach((checkbox) =>
            checkbox.classList.remove("checked")
          );
          checkbox.classList.add("checked");
          setStorageValue({ [id]: checkbox.getAttribute("value") });
        });
      });
    });
  }

  // page switch action
  const navItems = document.querySelectorAll(".navigation_item");
  const pages = document.querySelectorAll(".page");
  navItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      if (item.classList.contains("active")) return;

      navItems.forEach((item) => item.classList.remove("active"));
      item.classList.add("active");
      pages.forEach((page) => {
        page.classList.remove("lastActive");
        if (page.classList.contains("active")) {
          page.classList.add("lastActive");
          page.classList.remove("active");
        }
      });
      pages[0].classList.remove("initial_load");
      pages[i].classList.add("active");
    });
  });

  loadCheckboxInputs();
  loadMultipleChoiceInputs();

  // set correct background for header
  const { background } = await getStorageValue("background");
  const customBackgrounds = background.customBackgrounds.concat(
    (await getStorageValue("customBackgrounds", true)).customBackgrounds
  );
  const header = document.querySelector(".header");
  if (background.currentTab >= backgroundAmount) {
    header.style.background =
      CSS_BACKGROUND_PREFIX +
      customBackgrounds.find((bg) => bg.id === background.currentTab).bg;
  } else header.classList.add("background" + background.currentTab);

  // change text to selected language
  function applyLanguage(lang) {
    lang.tabs.map(
      (
        { title, checkboxes, multiple_choices, descriptions, subheader },
        index
      ) => {
        const page = pages[index];
        if (!page) return;

        if (title) page.querySelector(".page_header").textContent = title;

        if (checkboxes)
          page
            .querySelectorAll(".page_content>.checkbox_input span")
            .forEach((node, i) => {
              if (checkboxes[i] !== undefined) node.textContent = checkboxes[i];
            });

        if (multiple_choices)
          page.querySelectorAll(".multiple_choice").forEach((node, i) => {
            node.querySelectorAll(".checkbox_input span").forEach((node, j) => {
              if (multiple_choices[i] && multiple_choices[i][j] !== undefined)
                node.textContent = multiple_choices[i][j];
            });
          });

        if (descriptions)
          page.querySelectorAll(".description").forEach((node, i) => {
            if (descriptions[i] !== undefined)
              node.textContent = descriptions[i];
          });

        if (subheader)
          page.querySelectorAll(".subheader").forEach((node, i) => {
            if (subheader[i] !== undefined) node.textContent = subheader[i];
          });
      }
    );
  }

  applyLanguage(languages[(await getStorageValue("language")).language].popup);

  changeListener.push((changes) => {
    // add action in popup for darkModeFont
    if (changes.darkModeFont !== undefined)
      document.documentElement.classList[
        changes.darkModeFont.newValue ? "remove" : "add"
      ]("darkFont");
    // apply changed language
    if (changes.language !== undefined)
      applyLanguage(languages[changes.language.newValue].popup);
  });
}

popupInit();
