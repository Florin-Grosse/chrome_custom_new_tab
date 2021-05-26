async function websitesInit() {
  let { websites } = await getStorageValue(["websites"]);

  if (searchEngine === undefined) {
    setStorageValue({ websites: [] });
    websites = [];
  }

  const websites_wrapper = document.getElementById("website_icon_wrapper");
  function loadWebsites() {
    let tempEles = "";
    websites.forEach((ele) => {
      const shortURL = getURLRoot(ele.url);

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

    websites_wrapper.innerHTML =
      tempEles +
      '<div class="website_icon hover_highlight" id="add_website"><svg version="1.1" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" fill="var(--text)"><path d="m196.32 66.641c-11.121 1.523-20.336 10.124-22.564 21.061-0.595 2.915-0.629 5.436-0.633 45.856l-3e-3 39.558-83.6 0.091-1.6 0.366c-14.938 3.413-24.046 17.618-20.689 32.267 2.3 10.036 10.618 18.097 20.791 20.149 2.689 0.542 4.748 0.568 44.973 0.57l40.115 1e-3 0.11 82.64 0.344 1.76c3.922 20.053 26.608 28.866 42.711 16.593 5.881-4.482 9.61-11.346 10.28-18.925 0.104-1.172 0.163-16.221 0.164-41.945l1e-3 -40.116 82.8-0.102 1.84-0.356c18.452-3.572 27.69-24.026 18.113-40.109-3.707-6.226-10.064-10.727-17.57-12.439l-1.583-0.361-83.6-0.084v-40.381c0-40.733-0.018-42.1-0.577-44.895-2.746-13.713-15.951-23.099-29.823-21.199" fill-rule="evenodd"/></svg></div>' +
      Array.from({ length: 16 }, (x, i) => i)
        .map((i) => `<div class="website_icon"></div>`)
        .join("");
  }

  function addWebsitesEventListener() {
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

  function getURLRoot(url) {
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
    if (changes.searchEngine !== undefined) {
      searchEngine = changes.searchEngine.newValue;
      loadSearchEngine();
    }
  });

  loadWebsites();
  addWebsitesEventListener();
}

websitesInit();
