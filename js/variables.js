const multiple_choices = {
  search_engine: [
    {
      name: "None",
      id: "none",
      url: "",
    },
    {
      name: "DuckDuckGo",
      id: "duck",
      url: "https://duckduckgo.com",
    },
    {
      name: "Ecosia",
      id: "ecosia",
      url: "https://ecosia.org/search",
    },
    {
      name: "Google",
      id: "google",
      url: "https://google.com/search",
    },
    {
      name: "Startpage",
      id: "startpage",
      url: "https://startpage.com/search",
    },
    {
      name: "Qwant",
      id: "quant",
      url: "https://qwant.com",
    },
  ],
};

const languages = {
  en: {
    name: "English",
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    overlays: {
      backgroundConfirmDelete: {
        title: "Confirm deletion",
        confirm: "Delete",
      },
      backgroundAdd: {
        title: "Add background",
        confirm: "Apply",
      },
      websiteAdd: {
        title: "Add website",
        confirm: "Add",
        inputNames: ["URL", "Icon", "Small Icon"],
      },
      websiteEdit: {
        title: "Edit website",
        confirm: "Confirm",
        inputNames: ["URL", "Icon", "Small Icon"],
      },
    },
    paths: {
      // context menu
      "#open_website": {
        text: "Open in new tab",
      },
      "#toggle_drag": {
        text: "Toggle dragging",
      },
      "#edit_website": {
        text: "Edit website",
      },
      ".remove_website": {
        text: "Remove website",
      },
      // input placeholders
      "#search_bar": {
        placeholder: "Search",
      },
      ".note>input": {
        placeholder: "Title",
      },
      ".note>textarea": {
        placeholder: "Note",
      },
    },
  },
  de: {
    name: "Deutsch",
    weekdays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    overlays: {
      backgroundConfirmDelete: {
        title: "Löschen bestätigen",
        confirm: "Löschen",
      },
      backgroundAdd: {
        title: "Hintergrund hinzufügen",
        confirm: "Anwenden",
      },
      websiteAdd: {
        title: "Webseite hinzufügen",
        confirm: "Hinzufügen",
        inputNames: ["URL", "Icon", "Kleines Icon"],
      },
      websiteEdit: {
        title: "Webseite bearbeiten",
        confirm: "Speichern",
        inputNames: ["URL", "Icon", "Kleines Icon"],
      },
    },
    paths: {
      // context menu
      "#open_website": {
        text: "In neuem Tab öffnen",
      },
      "#toggle_drag": {
        text: "Verschieben aktivieren/deaktivieren",
      },
      "#edit_website": {
        text: "Webseite bearbeiten",
      },
      ".remove_website": {
        text: "Webseite entfernen",
      },
      // input placeholders
      "#search_bar": {
        placeholder: "Suchen",
      },
      ".note>input": {
        placeholder: "Titel",
      },
      ".note>textarea": {
        placeholder: "Notiz",
      },
    },
  },
};

const dateFormats = {
  default: "dd.mm.yy",
  defaultSlash: "dd/mm/yy",
  americanDot: "mm.dd.yy",
  americanSlash: "mm/dd/yy",
};

const backgroundAmount = 36;

// returns promise to get async storage data^
async function getStorageValue(values = null) {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get(values, function (options) {
      resolve(options);
    });
  });
}

async function setStorageValue(values) {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.set(values, function (options) {
      resolve(options);
    });
  });
}

// global onChangeListener for chrome storage
// type: ((data) => void)[]
let changeListener = [];

chrome.storage.onChanged.addListener((changes) => {
  changeListener.forEach((listener) => {
    listener(changes);
  });
});

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, debounce, maximumTime) {
  let timeoutAfterFinish;
  let periodicTimeout;
  return function () {
    let context = this,
      args = arguments;

    let callNow = !timeoutAfterFinish;
    clearTimeout(timeoutAfterFinish);
    timeoutAfterFinish = setTimeout(
      () => (timeoutAfterFinish = null),
      debounce
    );
    if (callNow) func.apply(context, args);

    if (!periodicTimeout) {
      periodicTimeout = setTimeout(() => {
        func.apply(context, args);
        periodicTimeout = null;
      }, maximumTime);
    }
  };
}
