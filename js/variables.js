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

const gradientAmount = 36;

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
