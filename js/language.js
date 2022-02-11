async function languageInit() {
  let { language } = await getStorageValue(["language"]);

  if (language === undefined) {
    setStorageValue({ language: "en" });
    language = "en";
  }

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

languageInit();
