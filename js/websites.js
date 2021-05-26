async function websitesInit() {
  let { websites } = await getStorageValue(["websites"]);

  if (websites === undefined) {
    setStorageValue({
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
    websites = [];
  }

  let canDrag = false;

  const websites_wrapper = document.getElementById("website_icon_wrapper");
  function loadWebsites() {
    let tempEles = "";
    websites.forEach((ele) => {
      const shortURL = getURLRoot(ele.url);

      tempEles +=
        '<a class="website_icon hover_highlight" href="' +
        ele.url +
        '" draggable="false"><img alt="' +
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
        '</a><div class="website_icon_margin"><div></div></div>';
    });

    websites_wrapper.innerHTML =
      tempEles +
      '<div class="website_icon hover_highlight" id="add_website"><svg version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="var(--text)"><path d="m196.32 66.641c-11.121 1.523-20.336 10.124-22.564 21.061-0.595 2.915-0.629 5.436-0.633 45.856l-3e-3 39.558-83.6 0.091-1.6 0.366c-14.938 3.413-24.046 17.618-20.689 32.267 2.3 10.036 10.618 18.097 20.791 20.149 2.689 0.542 4.748 0.568 44.973 0.57l40.115 1e-3 0.11 82.64 0.344 1.76c3.922 20.053 26.608 28.866 42.711 16.593 5.881-4.482 9.61-11.346 10.28-18.925 0.104-1.172 0.163-16.221 0.164-41.945l1e-3 -40.116 82.8-0.102 1.84-0.356c18.452-3.572 27.69-24.026 18.113-40.109-3.707-6.226-10.064-10.727-17.57-12.439l-1.583-0.361-83.6-0.084v-40.381c0-40.733-0.018-42.1-0.577-44.895-2.746-13.713-15.951-23.099-29.823-21.199" fill-rule="evenodd"/></svg></div>' +
      Array.from({ length: 16 }, (x, i) => i)
        .map((i) => `<div class="website_icon_filler"></div>`)
        .join("");

    requestAnimationFrame(() => addWebsitesEventListener());
  }

  function addWebsitesEventListener() {
    // display url when icon can't be loaded
    document
      .querySelectorAll(".website_icon img:not(.website_icon_small)")
      .forEach((ele) => {
        ele.addEventListener("error", (e) =>
          e.target.parentElement.classList.add("error")
        );
      });

    document
      .querySelectorAll(".website_icon:not(#add_website)")
      .forEach((ele) => {
        ele.addEventListener("mousedown", (e) => {
          if (!canDrag || e.button !== 0) return;
          e.preventDefault();
          initDrag(
            ele,
            e.clientX - ele.getBoundingClientRect().left,
            e.clientY - ele.getBoundingClientRect().top,
            e.pageX,
            e.pageY
          );
        });
        ele.addEventListener("dragstart", () => false);
      });

    // add listener to add website button
    document
      .getElementById("add_website")
      .addEventListener("click", async () => {
        try {
          const [url, icon, smallIcon] = await openOverlay(
            "Add Website",
            "Add",
            ["URL", "Icon", "Small Icon"],
            (values) => values[0]
          );
          addWebsite(url, icon, smallIcon);
        } catch (_) {}
      });
  }

  function initDrag(ele, xOffset, yOffset, xStart, yStart) {
    websites_wrapper.classList.add("holds_icon");
    let currentHover;
    const eleFiller = ele.nextElementSibling;
    eleFiller.style.display = "none";
    const mouseMove = (e) => {
      ele.style.top = e.pageY - yOffset + "px";
      ele.style.left = e.pageX - xOffset + "px";
      if (e.target.classList.contains("website_icon_margin"))
        currentHover = e.target;
      else currentHover = null;
    };
    const mouseUp = (e) => {
      e.preventDefault();
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
      ele.style.zIndex = null;
      ele.style.position = null;
      ele.style.top = null;
      ele.style.left = null;
      ele.style.pointerEvents = null;

      websites_wrapper.classList.remove("holds_icon");
      eleFiller.style.display = null;

      if (!currentHover) return;

      const oldPosition = getSiblingNumber(ele) / 2;

      ele.parentElement.insertBefore(ele, currentHover);
      ele.parentElement.insertBefore(eleFiller, ele);

      const newPosition = getSiblingNumber(ele) / 2;
      rotateWebsite(oldPosition, newPosition);
    };
    ele.style.position = "fixed";
    ele.style.pointerEvents = "none";
    ele.style.zIndex = 1000;
    ele.style.left = xStart - xOffset + "px";
    ele.style.left = yStart - yOffset + "px";
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  }

  function getSiblingNumber(ele) {
    let index = -1;
    for (; ele !== null; ele = ele.previousElementSibling) index++;
    return index;
  }

  function toggleDrag() {
    if (canDrag) {
      canDrag = false;
      websites_wrapper.classList.remove("drag_n_drop");
    } else {
      canDrag = true;
      websites_wrapper.classList.add("drag_n_drop");
    }
  }

  function addWebsite(url, icon, small_icon) {
    setStorageValue({
      websites: [
        ...websites,
        ...[
          {
            url: url,
            icon: icon || undefined,
            small_icon: small_icon || undefined,
          },
        ],
      ],
    });
    loadWebsites();
  }

  function removeWebsite(index) {
    setStorageValue({
      websites: [...websites.slice(0, index), ...websites.slice(index + 1)],
    });
    loadWebsites();
  }

  function editWebsite(index, url, icon, small_icon) {
    websites[index] = !small_icon
      ? {
          url,
          icon,
        }
      : {
          url,
          icon,
          small_icon,
        };
    setStorageValue({ websites });
    loadWebsites();
  }

  // moves website to a new index
  function rotateWebsite(oldIndex, newIndex) {
    const ele = websites[oldIndex];
    websites.splice(oldIndex, 1);
    websites = websites
      .slice(0, newIndex)
      .concat(ele)
      .concat(websites.slice(newIndex));
    setStorageValue({ websites });
  }

  function getURLRoot(url) {
    if (!url) return "";
    const urlRoot = url.replace(/^(.*\/\/[^\/?#]*).*$/, "$1");
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

    return shortURL;
  }

  // global change listener
  changeListener.push((changes) => {
    if (changes.websites !== undefined) {
      websites = changes.websites.newValue;
      loadWebsites();
    }
  });

  loadWebsites();

  /*--- context menu ---*/
  let index = 0;
  function addContextMenuEventListener() {
    const html = document.firstElementChild;
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

      index = websites.findIndex(
        (website) => website.url === e.target.getAttribute("href")
      );
    });

    //blur context menu
    document.addEventListener("click", () =>
      html.classList.remove("context_menu")
    );

    // remove website
    document
      .querySelectorAll(".remove_website")
      .forEach((ele) =>
        ele.addEventListener("click", () => removeWebsite(index))
      );

    // change order
    document.getElementById("toggle_drag").addEventListener("click", () => {
      toggleDrag();
    });

    // edit websites
    document
      .getElementById("edit_website")
      .addEventListener("click", async () => {
        try {
          const [url, icon, smallIcon] = await openOverlay(
            "Edit Website",
            "Confirm",
            [
              { name: "URL", value: websites[index].url },
              { name: "Icon", value: websites[index].icon || "" },
              { name: "Small Icon", value: websites[index].small_icon || "" },
            ],
            (values) => values[0]
          );
          editWebsite(index, url, icon, smallIcon);
        } catch (_) {}
      });

    // open website in new tab
    document.getElementById("open_website").addEventListener("click", () => {
      window.open(websites[context_menu_current_index].url, "_blank");
    });
  }
  addContextMenuEventListener();
}

websitesInit();
