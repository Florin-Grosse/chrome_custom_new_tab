async function searchInit() {
  let { searchEngine } = await getStorageValue(["searchEngine"]);

  if (searchEngine === undefined) {
    setStorageValue({ searchEngine: "duck" });
    searchEngine = "duck";
  }

  const search_bar = document.getElementById("search_bar_form");
  function loadSearchEngine() {
    if (searchEngine !== "none") {
      search_bar.style.display = null;
      search_bar.setAttribute(
        "action",
        multiple_choices.search_engine.find(
          (engine) => engine.id === searchEngine
        ).url
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
