// returns promise to get async storage data
async function getStorageValue(values = null) {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get(values, function (options) {
      resolve(options);
    });
  });
}

//set default if no other is defined
chrome.storage.sync.get(
  [
    "gradient",
    "websites",
    "searchEngine",
    "showSeconds",
    "showDate",
    "darkModeFont",
  ],
  (data) => {
    if (data.gradient === undefined)
      chrome.storage.sync.set({ gradient: 1 }, () =>
        console.log("Gradient resetted")
      );
    if (data.websites === undefined)
      chrome.storage.sync.set(
        {
          websites: [
            {
              url: "https://www.youtube.de",
              icon: "https://s.ytimg.com/yts/img/favicon_144-vfliLAfaB.png",
            },
            {
              url: "https://www.docs.google.com/document/u/0/",
              icon:
                "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
            },
            {
              icon:
                "https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png",
              url: "https://calendar.google.com/calendar/b/0/r",
            },
            {
              url: "https://www.amazon.de",
              icon: "https://www.amazon.de/favicon.ico",
            },
          ],
        },
        () => console.log("Reseted websites")
      );
    if (data.searchEngine === undefined)
      chrome.storage.sync.set({ searchEngine: "duck" }, () =>
        console.log("Reseted search engine")
      );
    if (data.showSeconds === undefined)
      chrome.storage.sync.set({ showSeconds: false }, () =>
        console.log("Reseted showSeconds")
      );
    if (data.showDate === undefined)
      chrome.storage.sync.set({ showDate: true }, () =>
        console.log("Reseted showDate")
      );
    if (data.darkModeFont === undefined)
      chrome.storage.sync.set({ darkModeFont: true }, () =>
        console.log("Reseted darkModeFont")
      );
    loadPage();
  }
);

const html = document.firstElementChild;
const content_wrapper = document.getElementById("content_wrapper");
const context_menu = document.getElementById("context_menu");
const search_bar = document.getElementById("search_bar_form");
const date = document.getElementById("date");
const overlay_elements = {
  button: document.getElementById("overlay_button"),
  header: document.querySelector("#add_website_overlay h1"),
};
const url = document.getElementById("add_website_url");
const icon = document.getElementById("add_website_icon");
const icon_span = document.querySelector(
  "#add_website_overlay span:nth-of-type(2)"
);
const small_icon = document.getElementById("add_website_small_icon");
const small_icon_span = document.querySelector(
  "#add_website_overlay span:nth-of-type(3)"
);

// update if setting change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.gradient !== undefined)
    changes.gradient.newValue === -1
      ? chrome.storage.sync.get("background", (data) =>
          changeGradient(changes.gradient.newValue, data.background)
        )
      : changeGradient(changes.gradient.newValue);
  if (changes.websites !== undefined) {
    websites = changes.websites.newValue;
    loadWebsites();
  }
  if (changes.showSeconds !== undefined) {
    show_seconds = changes.showSeconds.newValue;
    clearInterval(clockInterval);
    clockInterval = setInterval(loadClock, show_seconds ? 200 : 5000);
    loadClock();
  }
  if (changes.searchEngine !== undefined)
    loadSearchEngine(changes.searchEngine.newValue);
  if (changes.showDate !== undefined)
    changes.showDate.newValue === true
      ? (date.style.visibility = "")
      : (date.style.visibility = "none");
  if (changes.darkModeFont !== undefined)
    changes.darkModeFont.newValue
      ? html.classList.remove("lightFont")
      : html.classList.add("lightFont");
});

let websites = [];
let show_seconds = false;

let context_menu_current_index = 0;

/*
Personal websites:
[{url:"https://youtube.de",icon:"https://s.ytimg.com/yts/img/favicon_144-vfliLAfaB.png"},{url:"https://www.docs.google.com/document/u/0/",icon:"https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",small_icon:"https://lh3.googleusercontent.com/ogw/ADGmqu_v6Drh4e2SmuHXMZBueFyVqFcQSDR4ngw98NvC=s83-c-mo"},{url:"https://www.docs.google.com/document/u/1/",icon:"https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",small_icon:"https://lh3.googleusercontent.com/ogw/ADGmqu9DDMABLPW9Ti4W1e-OHDuxcdg_DXdW1nR4VvmW=s83-c-mo"},{url:"https://docs.google.com/spreadsheets/u/0/",icon:"https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico"},{url:"https://keep.google.com/u/0/",icon:"https://ssl.gstatic.com/keep/keep.ico"},{url:"https://calendar.google.com/calendar/b/0/r",icon:"https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png",small_icon:"https://lh3.googleusercontent.com/ogw/ADGmqu_v6Drh4e2SmuHXMZBueFyVqFcQSDR4ngw98NvC=s83-c-mo"},{url:"https://bitbucket.org/dashboard/overview",icon:"https://d301sr5gafysq2.cloudfront.net/frontbucket/build-favicon-default.3b48bd21f29d.ico"},{url:"https://amazon.de",icon:"https://amazon.de/favicon.ico"},{url:"https://thomann.de",icon:"https://images.static-thomann.de/pics/images/common/favicon.ico"}]
*/

// load / update website
function loadWebsites() {
  let tempEles = "";
  websites.forEach((ele) => {
    const urlRoot = ele.url.replace(/^(.*\/\/[^\/?#]*).*$/, "$1");
    const urlWithoutProtocol = urlRoot.startsWith("http://")
      ? urlRoot.slice(7)
      : urlRoot.startsWith("https://")
      ? urlRoot.slice(8)
      : urlRoot;
    const shortURL = urlWithoutProtocol.startsWith("www.")
      ? urlWithoutProtocol.slice(4)
      : urlWithoutProtocol.startsWith("www1.")
      ? urlWithoutProtocol.slice(5)
      : urlWithoutProtocol;
    tempEles +=
      '<a class="website_icon hover_highlight" href="' +
      ele.url +
      '"><img alt="' +
      shortURL +
      '" SameSite="Strict" src="' +
      ele.icon +
      '" />' +
      (ele.small_icon === undefined
        ? ""
        : '<img class="website_icon_small" alt="' +
          shortURL +
          '" SameSite="Strict" src="' +
          ele.small_icon +
          '" />') +
      "<p>" +
      shortURL +
      "</p>" +
      "</a>";
  });

  document.getElementById("website_icon_wrapper").innerHTML =
    tempEles +
    '<div class="website_icon hover_highlight" id="add_website"><svg version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="var(--font-color)"><path d="m196.32 66.641c-11.121 1.523-20.336 10.124-22.564 21.061-0.595 2.915-0.629 5.436-0.633 45.856l-3e-3 39.558-83.6 0.091-1.6 0.366c-14.938 3.413-24.046 17.618-20.689 32.267 2.3 10.036 10.618 18.097 20.791 20.149 2.689 0.542 4.748 0.568 44.973 0.57l40.115 1e-3 0.11 82.64 0.344 1.76c3.922 20.053 26.608 28.866 42.711 16.593 5.881-4.482 9.61-11.346 10.28-18.925 0.104-1.172 0.163-16.221 0.164-41.945l1e-3 -40.116 82.8-0.102 1.84-0.356c18.452-3.572 27.69-24.026 18.113-40.109-3.707-6.226-10.064-10.727-17.57-12.439l-1.583-0.361-83.6-0.084v-40.381c0-40.733-0.018-42.1-0.577-44.895-2.746-13.713-15.951-23.099-29.823-21.199" fill-rule="evenodd"/></svg></div>';

  // display url when icon can't be loaded
  document
    .querySelectorAll(".website_icon img:not(.website_icon_small)")
    .forEach((ele) =>
      ele.addEventListener("error", (e) =>
        e.target.parentElement.classList.add("error")
      )
    );

  document.getElementById("add_website").addEventListener("click", () => {
    edit_website = false;
    openOverlay(addWebsite, "Add", "Add Website");
  });
}

let last_confirm_fct;
function openOverlay(
  confirmFct,
  buttonText,
  header,
  displayIconInput = true,
  displaySmallIconInput = true
) {
  url.value = "";
  icon.value = "";
  small_icon.value = "";
  if (last_confirm_fct !== undefined)
    overlay_elements.button.removeEventListener("click", last_confirm_fct);
  overlay_elements.button.innerHTML = buttonText;
  overlay_elements.button.addEventListener("click", confirmFct);
  overlay_elements.header.innerHTML = header;
  icon.style.display = displayIconInput ? null : "none";
  icon_span.style.display = displayIconInput ? null : "none";
  small_icon.style.display = displaySmallIconInput ? null : "none";
  small_icon_span.style.display = displaySmallIconInput ? null : "none";
  html.classList.add("overlay");
  last_confirm_fct = confirmFct;
}

function closeOverlay() {
  html.classList.remove("overlay");
}

function addWebsite() {
  if (url.value !== "" && icon.value !== "") {
    chrome.storage.sync.set(
      {
        websites: [
          ...websites,
          ...[
            {
              url: url.value,
              icon: icon.value,
              small_icon:
                small_icon.value === "" ? undefined : small_icon.value,
            },
          ],
        ],
      },
      () => {
        console.log("Added website", {
          url: url.value,
          icon: icon.value,
          small_icon: small_icon.value === "" ? undefined : small_icon.value,
        });
        closeOverlay();
        reloadPage();
      }
    );
  }
}

function removeWebsite() {
  chrome.storage.sync.set(
    {
      websites: [
        ...websites.slice(0, context_menu_current_index),
        ...websites.slice(context_menu_current_index + 1),
      ],
    },
    () => console.log("Removed website", websites[context_menu_current_index])
  );
}

function editWebsite() {
  if (url.value !== "" && icon.value !== "") {
    websites[context_menu_current_index] =
      small_icon.value === ""
        ? {
            url: url.value,
            icon: icon.value,
          }
        : {
            url: url.value,
            icon: icon.value,
            small_icon: small_icon.value,
          };
    chrome.storage.sync.set(
      {
        websites: websites,
      },
      () => {
        console.log("Edited website", {
          url: url.value,
          icon: icon.value,
          small_icon: small_icon.value === "" ? undefined : small_icon.value,
        });
        closeOverlay();
        reloadPage();
      }
    );
  }
}

function loadSearchEngine(searchEngine) {
  if (searchEngine) {
    search_bar.style.display = null;
    search_bar.setAttribute(
      "action",
      search_engines.find((engine) => engine.id === searchEngine).url
    );
  } else {
    search_bar.style.display = "none";
  }
}

function loadDate() {
  document.getElementById("date").innerHTML =
    ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][new Date().getDay()] +
    ", " +
    new Date().toLocaleDateString("de");
}

const settings = document.getElementById("settings");
const gradientIconsWrapper = document.getElementById("gradient_options");
function loadSettings() {
  let gradientIcons = Array.from({ length: gradientAmount }, (x, i) => i)
    .map((index) => `<div class="gradient${index} gradient_option"></diV>`)
    .join("");

  gradientIconsWrapper.innerHTML +=
    gradientIcons +
    '<div class="gradient_option add_background"><svg version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="var(--font-color)"><path d="m196.32 66.641c-11.121 1.523-20.336 10.124-22.564 21.061-0.595 2.915-0.629 5.436-0.633 45.856l-3e-3 39.558-83.6 0.091-1.6 0.366c-14.938 3.413-24.046 17.618-20.689 32.267 2.3 10.036 10.618 18.097 20.791 20.149 2.689 0.542 4.748 0.568 44.973 0.57l40.115 1e-3 0.11 82.64 0.344 1.76c3.922 20.053 26.608 28.866 42.711 16.593 5.881-4.482 9.61-11.346 10.28-18.925 0.104-1.172 0.163-16.221 0.164-41.945l1e-3 -40.116 82.8-0.102 1.84-0.356c18.452-3.572 27.69-24.026 18.113-40.109-3.707-6.226-10.064-10.727-17.57-12.439l-1.583-0.361-83.6-0.084v-40.381c0-40.733-0.018-42.1-0.577-44.895-2.746-13.713-15.951-23.099-29.823-21.199" fill-rule="evenodd"/></svg></div>';

  document
    .querySelectorAll(".gradient_option:not(:last-of-type)")
    .forEach((ele, index) =>
      ele.addEventListener("click", () =>
        chrome.storage.sync.set({ gradient: index }, () =>
          console.log("Changed gradient to " + index)
        )
      )
    );

  document
    .querySelector(".gradient_option:last-of-type")
    .addEventListener("click", () =>
      openOverlay(
        () => {
          if (url.value === "") return;
          chrome.storage.sync.set({
            background: url.value,
            gradient: -1,
          });
          closeOverlay();
        },
        "Apply",
        "Change Background",
        false,
        false
      )
    );

  document
    .querySelector("#settings>svg")
    .addEventListener("click", (e) =>
      settings.classList.contains("open")
        ? settings.classList.remove("open")
        : settings.classList.add("open")
    );
  content_wrapper.addEventListener("click", (e) =>
    e.target.id !== "settings" && e.target.parentElement.id !== "settings"
      ? settings.classList.remove("open")
      : null
  );
}

const background_element = document.getElementById("background");
function changeGradient(index, background = "") {
  for (let i = 0; i < gradientAmount; i++) {
    html.classList.remove("gradient" + i);
  }
  if (index === -1) {
    background_element.style.backgroundImage = "url('" + background + "')";
  } else {
    background_element.style.backgroundImage = "var(--background)";
    html.classList.add("gradient" + index);
    settings.classList.remove("open");
  }
}

const clock = document.getElementById("clock");
let clockInterval;
function loadClock() {
  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();
  const seconds = new Date().getSeconds();
  clock.innerHTML =
    '<p class="clock_time">' +
    hours
      .toString()
      .replace("0", "O")
      .padStart(2, "O")
      .split("")
      .join('</p><p class="clock_time">') +
    '</p><p>:</p><p class="clock_time">' +
    minutes
      .toString()
      .replace("0", "O")
      .padStart(2, "O")
      .split("")
      .join('</p><p class="clock_time">') +
    "</p><p>:</p>" +
    (show_seconds
      ? '<p class="clock_time">' +
        seconds
          .toString()
          .replace("0", "O")
          .padStart(2, "O")
          .split("")
          .join('</p><p class="clock_time">')
      : "") +
    "</p>";
}

async function loadPage() {
  /*----- add eventListener ------*/
  //close overlay on esc press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlay();
  });
  //close overlay on click
  document.addEventListener("click", (e) =>
    e.target.id === "add_website_overlay" ? closeOverlay() : null
  );

  //overlay submit on enter
  document.addEventListener("keypress", (e) =>
    e.keyCode === 13 ? (edit_website ? editWebsite() : addWebsite()) : null
  );

  //context menu to delete websites
  document.addEventListener("contextmenu", (e) => {
    if (
      e.target.parentElement.id !== "website_icon_wrapper" ||
      e.target.id === "add_website"
    )
      return html.classList.remove("context_menu");
    html.classList.add("context_menu");
    e.preventDefault();

    let top = e.y;
    let left = e.x;

    if (top > window.innerHeight / 2)
      top -= context_menu.getBoundingClientRect().height;
    if (left > window.innerWidth / 2)
      left -= context_menu.getBoundingClientRect().width;

    context_menu.style.left = left + "px";
    context_menu.style.top = top + "px";

    context_menu_current_index = websites.findIndex(
      (website) => website.url === e.target.getAttribute("href")
    );
  });

  //blur context menu
  document.addEventListener("click", () =>
    html.classList.remove("context_menu")
  );

  //add event handler
  document
    .querySelectorAll(".remove_website")
    .forEach((ele) => ele.addEventListener("click", () => removeWebsite()));
  document.getElementById("edit_website").addEventListener("click", () => {
    openOverlay(editWebsite, "Confirm", "Edit Website");
    url.value = websites[context_menu_current_index].url;
    icon.value = websites[context_menu_current_index].icon;
    small_icon.value =
      websites[context_menu_current_index].small_icon === undefined
        ? ""
        : websites[context_menu_current_index].small_icon;
  });

  document
    .getElementById("close_overlay_svg")
    .addEventListener("click", () => closeOverlay());

  const data = await getStorageValue([
    "websites",
    "searchEngine",
    "showDate",
    "showSeconds",
    "gradient",
    "darkModeFont",
  ]);

  //load websites
  websites = data.websites;
  loadWebsites();
  //load correct search engine
  loadSearchEngine(data.searchEngine);

  //load if date should be visible
  date.style.display = data.showDate === true ? null : "none";

  //load gradient
  data.gradient === -1
    ? chrome.storage.sync.get("background", (bg) =>
        changeGradient(data.gradient, bg.background)
      )
    : changeGradient(data.gradient);

  //load show seconds
  show_seconds = data.showSeconds;

  //load font color
  if (!data.darkModeFont) html.classList.add("lightFont");

  reloadPage();
  loadClock();
  clockInterval = setInterval(loadClock, show_seconds ? 200 : 5000);
}

function reloadPage() {
  loadDate();
  loadSettings();
}
