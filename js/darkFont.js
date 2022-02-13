async function fontInit() {
  let { darkModeFont } = await getStorageValue(["darkModeFont"]);

  const html = document.firstElementChild;
  function loadDarkModeFont() {
    if (darkModeFont) html.classList.remove("darkFont");
    else html.classList.add("darkFont");
  }

  // global change listener
  changeListener.push((changes) => {
    if (changes.darkModeFont !== undefined) {
      darkModeFont = changes.darkModeFont.newValue;
      loadDarkModeFont();
    }
  });

  loadDarkModeFont();
}

fontInit();
