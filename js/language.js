async function languageInit() {
  let { language } = await getStorageValue(["language"]);

  function applyLanguage() {
    Object.entries(languages[language].paths).forEach(
      ([path, { text, ...rest }]) => {
        document.querySelectorAll(path).forEach((ele) => {
          ele.textContent = text;
          Object.entries(rest).forEach(([name, value]) =>
            ele.setAttribute(name, value)
          );
        });
      }
    );
  }

  changeListener.push((changes) => {
    if (changes.language !== undefined) {
      language = changes.language.newValue;
      applyLanguage();
    }
  });
}

languageInit();
