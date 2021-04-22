//set default if no other is defined
chrome.storage.sync.get(
  [
    "background",
    "websites",
    "searchEngine",
    "showSeconds",
    "showDate",
    "darkModeFont",
  ],
  (data) => {
    if (data.background === undefined)
      chrome.storage.sync.set({
        background: { selected: [0], customBackgrounds: [], currentTab: 0 },
      });
    if (data.websites === undefined)
      chrome.storage.sync.set({
        websites: [],
      });
    if (data.searchEngine === undefined)
      chrome.storage.sync.set({ searchEngine: "duck" });
    if (data.showSeconds === undefined)
      chrome.storage.sync.set({ showSeconds: false });
    if (data.showDate === undefined)
      chrome.storage.sync.set({ showDate: true });
    if (data.darkModeFont === undefined)
      chrome.storage.sync.set({ darkModeFont: true });
    loadPage();
  }
);
const content_wrapper = document.getElementById("content_wrapper");

async function loadPage() {
  //laod show seconds checkbox action
  document.getElementById("show_seconds").addEventListener("click", (e) => {
    if (e.target.classList.contains("checked")) {
      e.target.classList.remove("checked");
      chrome.storage.sync.set({ showSeconds: false });
    } else {
      e.target.classList.add("checked");
      chrome.storage.sync.set({ showSeconds: true });
    }
  });

  //laod show date checkbox action
  document.getElementById("show_date").addEventListener("click", (e) => {
    if (e.target.classList.contains("checked")) {
      e.target.classList.remove("checked");
      chrome.storage.sync.set({ showDate: false });
    } else {
      e.target.classList.add("checked");
      chrome.storage.sync.set({ showDate: true });
    }
  });

  //laod show notepad checkbox action
  document.getElementById("show_notepad").addEventListener("click", (e) => {
    if (e.target.classList.contains("checked")) {
      e.target.classList.remove("checked");
      chrome.storage.sync.set({ notepad: null });
    } else {
      e.target.classList.add("checked");
      chrome.storage.sync.set({ notepad: "" });
    }
  });

  //laod dark mode font color checkbox action
  document.getElementById("dark_mode_font").addEventListener("click", (e) => {
    chrome.storage.sync.set({
      darkModeFont: !e.target.classList.contains("checked"),
    });
    e.target.classList.toggle("checked");
    document.documentElement.classList.toggle("darkFont");
  });

  //load search engines
  document.querySelector("#search_engine .options_container").innerHTML =
    '<div class="checkbox_input" engine="clear"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svg_checkbox"><path class="svg_checkbox_false" d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /><path class="svg_checkbox_true" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29c-.39.39-1.02.39-1.41 0L5.71 12.7c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10 14.17l6.88-6.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-7.58 7.59z"/></svg><span>None</span></div>' +
    search_engines
      .map(
        (engine) =>
          '<div class="checkbox_input" engine="' +
          engine.id +
          '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svg_checkbox"><path class="svg_checkbox_false" d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /><path class="svg_checkbox_true" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29c-.39.39-1.02.39-1.41 0L5.71 12.7c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10 14.17l6.88-6.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-7.58 7.59z"/></svg><span>' +
          engine.name +
          "</span></div>"
      )
      .join("");

  //laod search engine checkbox action
  document.querySelectorAll("#search_engine .checkbox_input").forEach((ele) => {
    ele.addEventListener("click", (e) => {
      if (!e.target.classList.contains("checked")) {
        [...e.target.parentElement.children].forEach((ele) =>
          ele.classList.remove("checked")
        );
        e.target.classList.add("checked");
        const engine = e.target.getAttribute("engine");
        chrome.storage.sync.set({
          searchEngine: engine === "clear" ? null : engine,
        });
      }
    });
  });

  // apply correct states
  const {
    background,
    showSeconds,
    showDate,
    searchEngine,
    darkModeFont,
    notepad,
  } = await getStorageValue([
    "background",
    "showSeconds",
    "showDate",
    "searchEngine",
    "darkModeFont",
    "notepad",
  ]);

  // set correct background
  if (background.currentTab >= gradientAmount) {
    content_wrapper.style.background = background.customBackgrounds.find(
      (bg) => bg.id === background.currentTab
    ).bg;
  } else content_wrapper.classList.add("gradient" + background.currentTab);

  //load checkbox for show_seconds in correct state
  if (showSeconds)
    document.getElementById("show_seconds").classList.add("checked");

  //load checkbox for show_seconds in correct state
  if (showDate) document.getElementById("show_date").classList.add("checked");

  //load checkbox for show_notepad in correct state
  if (notepad) document.getElementById("show_notepad").classList.add("checked");

  //load checkbox for darkModeFont in correct state
  if (darkModeFont) {
    document.getElementById("dark_mode_font").classList.add("checked");
  } else document.documentElement.classList.add("darkFont");

  //load search engine in correct state
  document
    .querySelector("[engine=" + (searchEngine || "clear") + "]")
    .classList.add("checked");
}
