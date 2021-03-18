//set default if no other is defined
chrome.storage.sync.get(
  [
    "gradient",
    "websites",
    "searchEngine",
    "showSeconds",
    "showDate",
    "darkModeFont",
  ],
  (data) => {
    if (data.gradient === undefined)
      chrome.storage.sync.set({ gradient: 1 }, () =>
        console.log("Reseted gradient")
      );
    if (data.websites === undefined)
      chrome.storage.sync.set(
        {
          websites: [
            {
              url: "https://www.youtube.de",
              icon: "https://s.ytimg.com/yts/img/favicon_144-vfliLAfaB.png",
            },
            {
              url: "https://www.docs.google.com/document/u/0/",
              icon:
                "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
            },
            {
              icon:
                "https://calendar.google.com/googlecalendar/images/favicon_v2018_256.png",
              url: "https://calendar.google.com/calendar/b/0/r",
            },
            {
              url: "https://www.amazon.de",
              icon:
                "https://icons.iconarchive.com/icons/bokehlicia/pacifica/256/amazon-icon.png",
            },
          ],
        },
        () => console.log("Reseted websites")
      );
    if (data.searchEngine === undefined)
      chrome.storage.sync.set({ searchEngine: "duck" }, () =>
        console.log("Reseted search engine")
      );
    if (data.showSeconds === undefined)
      chrome.storage.sync.set({ showSeconds: false }, () =>
        console.log("Reseted showSeconds")
      );
    if (data.showDate === undefined)
      chrome.storage.sync.set({ showDate: true }, () =>
        console.log("Reseted showDate")
      );
    if (data.darkModeFont === undefined)
      chrome.storage.sync.set({ darkModeFont: true }, () =>
        console.log("Reseted darkModeFont")
      );
    loadPage();
  }
);
const content_wrapper = document.getElementById("content_wrapper");

function loadPage() {
  //laod show seconds checkbox action
  document.getElementById("show_seconds").addEventListener("click", (e) => {
    if (e.target.classList.contains("checked")) {
      e.target.classList.remove("checked");
      chrome.storage.sync.set({ showSeconds: false }, () =>
        console.log("Disabled seconds on clock")
      );
    } else {
      e.target.classList.add("checked");
      chrome.storage.sync.set({ showSeconds: true }, () =>
        console.log("Enabled seconds on clock")
      );
    }
  });

  //laod show date checkbox action
  document.getElementById("show_date").addEventListener("click", (e) => {
    if (e.target.classList.contains("checked")) {
      e.target.classList.remove("checked");
      chrome.storage.sync.set({ showDate: false }, () =>
        console.log("Disabled date")
      );
    } else {
      e.target.classList.add("checked");
      chrome.storage.sync.set({ showDate: true }, () =>
        console.log("Enabled date")
      );
    }
  });

  //laod dark mode font color checkbox action
  document.getElementById("dark_mode_font").addEventListener("click", (e) => {
    if (e.target.classList.contains("checked")) {
      e.target.classList.remove("checked");
      chrome.storage.sync.set({ darkModeFont: false }, () =>
        console.log("Disabled light font")
      );
    } else {
      e.target.classList.add("checked");
      chrome.storage.sync.set({ darkModeFont: true }, () =>
        console.log("Enabled light font")
      );
    }
  });

  //load search engines
  document.querySelector(
    "#search_engine .options_container"
  ).innerHTML = search_engines
    .map(
      (engine) =>
        '<div class="checkbox_input" id="' +
        engine.id +
        '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svg_checkbox"><path class="svg_checkbox_false" d="M18 19H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" /><path class="svg_checkbox_true" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.29 13.29c-.39.39-1.02.39-1.41 0L5.71 12.7c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10 14.17l6.88-6.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-7.58 7.59z"/></svg><span>' +
        engine.name +
        "</span></div>"
    )
    .join("");

  //laod engine checkbox action
  document
    .querySelectorAll("#search_engine .checkbox_input")
    .forEach((ele, index) => {
      console.log(ele);
      ele.addEventListener("click", (e) => {
        console.log("click", index);
        if (!e.target.classList.contains("checked")) {
          [...e.target.parentElement.children].forEach((ele) =>
            ele.classList.remove("checked")
          );
          e.target.classList.add("checked");
          chrome.storage.sync.set(
            { searchEngine: search_engines[index].id },
            () =>
              console.log(
                "Changed search engine to " + search_engines[index].name
              )
          );
        }
      });
    });

  chrome.storage.sync.get(
    ["gradient", "showSeconds", "showDate", "searchEngine", "darkModeFont"],
    (data) => {
      content_wrapper.classList.add("gradient" + data.gradient);

      //load checkbox for show_seconds in correct state
      if (data.showSeconds)
        document.getElementById("show_seconds").classList.add("checked");

      //load checkbox for show_seconds in correct state
      if (data.showDate)
        document.getElementById("show_date").classList.add("checked");

      //load checkbox for darkModeFont in correct state
      if (data.showDate)
        document.getElementById("dark_mode_font").classList.add("checked");

      //load search engine in correct state
      document.getElementById(data.searchEngine).classList.add("checked");
    }
  );
}
