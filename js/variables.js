const languages = {
  en: {
    name: "English",
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    overlays: {
      backgroundConfirmDelete: {
        title: "Confirm deletion",
        confirm: "Delete",
      },
      backgroundAddOptions: {
        title: "Add background",
        image: "image",
        gradient: "gradient",
        color: "color",
      },
      backgroundAddImage: {
        title: "Add background image",
        confirm: "Apply",
      },
      backgroundAddGradient: {
        title: "Add background gradient",
        confirm: "Apply",
      },
      backgroundAddColor: {
        title: "Add background color",
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
      websiteConfirmDelete: {
        title: "Confirm deletion",
        confirm: "Delete",
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
      backgroundAddOptions: {
        title: "Hintergrund hinzufügen",
        image: "Bild",
        gradient: "Farbverlauf",
        color: "Farbe",
      },
      backgroundAddImage: {
        title: "Hintergrundbild hinzufügen",
        confirm: "hinzufügen",
      },
      backgroundAddGradient: {
        title: "Hintergrundfarbverlauf hinzufügen",
        confirm: "Hinzufügen",
      },
      backgroundAddColor: {
        title: "Hintergrundfarbe hinzufügen",
        confirm: "Hinzufügen",
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
      websiteConfirmDelete: {
        title: "Löschen bestätigen",
        confirm: "Löschen",
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
  languages: Object.entries(languages).map(([id, lang]) => ({ id, ...lang })),
  dateFormats: Object.entries(dateFormats).map(([id, name]) => ({ id, name })),
  clockFormats: [
    {
      id: "12h",
      name: "12h",
    },
    {
      id: "am/pm",
      name: "am/pm",
    },
  ],
};

const backgroundAmount = 36;

const defaultStorageValues = {
  background: {
    currentTab: 0,
    customBackgrounds: [],
    selected: [0],
  },
  clockFormat: "12h",
  darkModeFont: true,
  dateFormat: "default",
  language: "en",
  notes: [{ title: "", note: "" }],
  searchEngine: "duck",
  showDate: true,
  showNotes: true,
  showSeconds: true,
  showTIme: true,
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
};

// returns promise to get async storage data
// initializes data if value is not defined yet
async function getStorageValue(values = null) {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get(values, async function (options) {
      if (Array.isArray(values)) {
        await Promise.all(
          values
            .map((key) => {
              if (options[key] === undefined) {
                options[key] = defaultStorageValues[key];
                return setStorageValue({ [key]: options[key] });
              }
              return null;
            })
            .filter(Boolean)
        );
      } else if (typeof values === "string") {
        if (options[values] === undefined) {
          options[values] = defaultStorageValues[values];
          await setStorageValue({ [values]: options[values] });
        }
      }
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
