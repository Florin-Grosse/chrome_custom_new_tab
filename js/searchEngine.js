async function searchInit() {
  let { searchEngine } = await getStorageValue(["searchEngine"]);

  if (searchEngine === undefined) {
    chrome.storage.sync.set({ searchEngine: "duck" });
    searchEngine = "duck";
  }

  const search_bar = document.getElementById("search_bar_form");
  function loadSearchEngine() {
    if (searchEngine) {
      search_bar.style.display = null;
      search_bar.setAttribute(
        "action",
        search_engines.find((engine) => engine.id === searchEngine).url
      );
    } else search_bar.style.display = "none";
  }

  // global change listener
  changeListener.push((changes) => {
    if (changes.searchEngine !== undefined) {
      searchEngine = changes.searchEngine.newValue;
      loadSearchEngine();
    }
  });

  loadSearchEngine();
}

searchInit();
