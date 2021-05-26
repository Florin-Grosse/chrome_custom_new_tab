//set default if no other is defined
getStorageValue([
  "background",
  "websites",
  "searchEngine",
  "showSeconds",
  "showDate",
  "darkModeFont",
  "notepad",
]).then((data) => {
  if (data.background === undefined)
    setStorageValue({
      background: { selected: [0], customBackgrounds: [], currentTab: 0 },
    });
  if (data.websites === undefined)
    setStorageValue({
      websites: [],
    });
  if (data.searchEngine === undefined)
    setStorageValue({ searchEngine: "duck" });
  loadPage();
});

async function loadPage() {
  // navigation action
  const navItems = document.querySelectorAll(".navigation_item");
  const pages = document.querySelectorAll(".page");
  navItems.forEach((item, i) => {
    item.addEventListener("click", () => {
      if (item.classList.contains("active")) return;

      navItems.forEach((item) => item.classList.remove("active"));
      item.classList.add("active");
      pages.forEach((page) => page.classList.remove("active"));
      pages[0].classList.remove("initial_load");
      pages[i].classList.add("active");
    });
  });

  loadCheckboxInputs();

  // add action in popup for darkModeFont
  changeListener.push((changes) => {
    if (changes.darkModeFont !== undefined)
      document.documentElement.classList[
        changes.darkModeFont.newValue ? "remove" : "add"
      ]("darkFont");
  });

  loadMultipleChoiceInputs();

  // set correct gradient
  const { background } = await getStorageValue(["background"]);
  const header = document.querySelector(".header");
  if (background.currentTab >= gradientAmount) {
    header.style.background = background.customBackgrounds.find(
      (bg) => bg.id === background.currentTab
    ).bg;
  } else header.classList.add("gradient" + background.currentTab);
}

function loadCheckboxInputs() {
  document.querySelectorAll(".checkbox_input").forEach(async (checkbox) => {
    // return if this checkbox is set to manual
    const id = checkbox.getAttribute("data-id");
    if (checkbox.hasAttribute("manual") || id === null) return;
    // get id of data
    let status = (await getStorageValue(id))[id];
    // set default value
    if (status !== true && status !== false) {
      status = checkbox.getAttribute("data-default") === "true";
      setStorageValue({ [id]: status });
    }

    // apply initial status
    if (status) checkbox.classList.add("checked");
    else checkbox.classList.remove("checked");

    // add eventListener
    checkbox.addEventListener("click", () => {
      status = !status;
      if (status) checkbox.classList.add("checked");
      else checkbox.classList.remove("checked");
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
      setStorageValue({ [id]: status });
    }

    root.innerHTML = multiple_choices[root.getAttribute("data-src")]
      .map(
        (data) =>
          '<div class="checkbox_input" manual value="' +
          data.id +
          '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svg_checkbox"><path class="svg_checkbox_false" d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /><path class="svg_checkbox_true" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29c-.39.39-1.02.39-1.41 0L5.71 12.7c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10 14.17l6.88-6.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-7.58 7.59z"/></svg><span>' +
          data.name +
          "</span></div>"
      )
      .join("");

    //load initial state
    root.querySelector("[value=" + status + "]").classList.add("checked");

    const checkboxes = root.querySelectorAll(".checkbox_input");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("click", () => {
        checkboxes.forEach((checkbox) => checkbox.classList.remove("checked"));
        checkbox.classList.add("checked");
        setStorageValue({ [id]: checkbox.getAttribute("value") });
      });
    });
  });
}
