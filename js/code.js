//set default if no other is defined
getStorageValue("websites").then(async (data) => {
  if (data === undefined) {
    await setStorageValue({
      websites: [
        {
          url: "https://www.youtube.de",
          icon: "https://s.ytimg.com/yts/img/favicon_144-vfliLAfaB.png",
        },
        {
          url: "https://www.docs.google.com/document/u/0/",
          icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
        },
        {
          url: "https://calendar.google.com/calendar/b/0/r",
          icon: "https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png",
        },
        {
          url: "https://www.amazon.de",
          icon: "https://www.amazon.de/favicon.ico",
        },
      ],
    });
  }
  loadPage();
});

const html = document.firstElementChild;
const content_wrapper = document.getElementById("content_wrapper");
const context_menu = document.getElementById("context_menu");
const overlay_elements = {
  button: document.getElementById("overlay_button"),
  header: document.querySelector("#add_website_overlay h1"),
};
const url = document.getElementById("add_website_url");
const url_span = document.querySelector(
  "#add_website_overlay span:first-of-type"
);
const icon = document.getElementById("add_website_icon");
const icon_span = document.querySelector(
  "#add_website_overlay span:nth-of-type(2)"
);
const small_icon = document.getElementById("add_website_small_icon");
const small_icon_span = document.querySelector(
  "#add_website_overlay span:nth-of-type(3)"
);

// update if setting change
changeListener.push((changes) => {
  if (changes.websites !== undefined) {
    websites = changes.websites.newValue;
    loadWebsites();
  }
});

let websites = [];

let context_menu_current_index = 0;

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
    '<div class="website_icon hover_highlight" id="add_website"><svg version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="var(--text)"><path d="m196.32 66.641c-11.121 1.523-20.336 10.124-22.564 21.061-0.595 2.915-0.629 5.436-0.633 45.856l-3e-3 39.558-83.6 0.091-1.6 0.366c-14.938 3.413-24.046 17.618-20.689 32.267 2.3 10.036 10.618 18.097 20.791 20.149 2.689 0.542 4.748 0.568 44.973 0.57l40.115 1e-3 0.11 82.64 0.344 1.76c3.922 20.053 26.608 28.866 42.711 16.593 5.881-4.482 9.61-11.346 10.28-18.925 0.104-1.172 0.163-16.221 0.164-41.945l1e-3 -40.116 82.8-0.102 1.84-0.356c18.452-3.572 27.69-24.026 18.113-40.109-3.707-6.226-10.064-10.727-17.57-12.439l-1.583-0.361-83.6-0.084v-40.381c0-40.733-0.018-42.1-0.577-44.895-2.746-13.713-15.951-23.099-29.823-21.199" fill-rule="evenodd"/></svg></div>' +
    Array.from({ length: 16 }, (x, i) => i)
      .map((i) => `<div class="website_icon_filler"></div>`)
      .join("");

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
  displaySmallIconInput = true,
  displayURLInput = true
) {
  url.value = "";
  icon.value = "";
  small_icon.value = "";
  if (last_confirm_fct !== undefined)
    overlay_elements.button.removeEventListener("click", last_confirm_fct);
  overlay_elements.button.innerHTML = buttonText;
  overlay_elements.button.addEventListener("click", confirmFct);
  overlay_elements.header.innerHTML = header;
  url.style.display = displayURLInput ? null : "none";
  url_span.style.display = displayURLInput ? null : "none";
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

async function addWebsite() {
  if (url.value !== "" && icon.value !== "") {
    await setStorageValue({
      websites: [
        ...websites,
        ...[
          {
            url: url.value,
            icon: icon.value,
            small_icon: small_icon.value === "" ? undefined : small_icon.value,
          },
        ],
      ],
    });
    console.log("Added website", {
      url: url.value,
      icon: icon.value,
      small_icon: small_icon.value === "" ? undefined : small_icon.value,
    });
    closeOverlay();
    reloadPage();
  }
}

async function removeWebsite() {
  await setStorageValue({
    websites: [
      ...websites.slice(0, context_menu_current_index),
      ...websites.slice(context_menu_current_index + 1),
    ],
  });
  console.log("Removed website", websites[context_menu_current_index]);
}

async function editWebsite() {
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
    await setStorageValue({ websites });
    console.log("Edited website", {
      url: url.value,
      icon: icon.value,
      small_icon: small_icon.value === "" ? undefined : small_icon.value,
    });
    closeOverlay();
    reloadPage();
  }
}

async function loadPage() {
  /*----- add eventListener ------*/
  //close overlay on esc press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeOverlay();
    }
  });
  //close overlay on click
  document.addEventListener("click", (e) =>
    e.target.id === "add_website_overlay" ? closeOverlay() : null
  );

  //overlay submit on enter
  document.addEventListener("keypress", (e) =>
    e.key === "Enter" ? (edit_website ? editWebsite() : addWebsite()) : null
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
  document.getElementById("open_website").addEventListener("click", () => {
    window.open(websites[context_menu_current_index].url, "_blank");
  });

  document
    .getElementById("close_overlay_svg")
    .addEventListener("click", () => closeOverlay());

  const data = await getStorageValue(["websites"]);

  //load websites
  websites = data.websites;
  loadWebsites();

  reloadPage();
}

function reloadPage() {}
