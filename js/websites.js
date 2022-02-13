async function websitesInit() {
  let { websites, language } = await getStorageValue(["websites", "language"]);

  let canDrag = false;

  const websites_wrapper = document.getElementById("website_icon_wrapper");
  const website_icon_template = document.getElementById(
    "website_icon_template"
  );
  const add_website_button = document.getElementById("add_website");
  function loadWebsites() {
    websites_wrapper
      .querySelectorAll(".website_icon_outer")
      .forEach((ele) => ele.remove());
    websites.forEach((ele) => {
      const shortURL = getURLRoot(ele.url);
      const element = website_icon_template.content.cloneNode(true).children[0];

      element.querySelector("a").setAttribute("href", ele.url);
      const img = element.querySelector("img:not(.website_icon_small)");
      img.setAttribute("src", ele.icon);
      img.setAttribute("alt", shortURL);
      if (ele.small_icon !== undefined) {
        const smallImg = element.querySelector("img.website_icon_small");
        smallImg.setAttribute("src", ele.small_icon);
        smallImg.setAttribute("alt", shortURL);
      }
      element.querySelector("p").innerText = shortURL;

      websites_wrapper.insertBefore(element, add_website_button);
    });

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

    // move icon to mouse while dragging
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
        // prevent dragging of website icons
        ele.addEventListener("dragstart", () => false);
      });

    // add listener to add website button
    document
      .getElementById("add_website")
      .addEventListener("click", async () => {
        try {
          const overlayText = languages[language].overlays.websiteAdd;
          const [url, icon, smallIcon] = await openOverlay(
            overlayText.title,
            overlayText.title,
            overlayText.inputNames,
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

      // -1 since template is first child in DOM
      const oldPosition = getSiblingNumber(ele.parentElement) - 1;

      websites_wrapper.insertBefore(
        ele.parentElement,
        currentHover.parentElement.nextElementSibling
      );

      const newPosition = getSiblingNumber(ele.parentElement) - 1;
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
        e.target.parentElement.parentElement.id !== "website_icon_wrapper" ||
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
          const overlayText = languages[language].overlays.websiteEdit;
          const [url, icon, smallIcon] = await openOverlay(
            overlayText.title,
            overlayText.confirm,
            [
              { name: overlayText.inputNames[0], value: websites[index].url },
              {
                name: overlayText.inputNames[1],
                value: websites[index].icon || "",
              },
              {
                name: overlayText.inputNames[2],
                value: websites[index].small_icon || "",
              },
            ],
            (values) => values[0]
          );
          editWebsite(index, url, icon, smallIcon);
        } catch (_) {}
      });

    // open website in new tab
    document.getElementById("open_website").addEventListener("click", () => {
      window.open(websites[index].url, "_blank");
    });
  }
  addContextMenuEventListener();
}

websitesInit();
