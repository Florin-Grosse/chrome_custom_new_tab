async function clockInit() {
  let { showSeconds, showDate } = await getStorageValue([
    "showSeconds",
    "showDate",
  ]);

  if (showSeconds === undefined) {
    chrome.storage.sync.set({ showSeconds: false });
    showSeconds = false;
  }

  if (showDate === undefined) {
    chrome.storage.sync.set({ showDate: false });
    showDate = false;
  }

  const date = document.getElementById("date");
  function loadDate() {
    if (showDate) {
      date.style.display = "";
      date.innerHTML =
        ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][new Date().getDay()] +
        ", " +
        new Date().toLocaleDateString("de");
    } else date.style.display = "none";
  }

  const clock = document.getElementById("clock");
  let clockInterval;
  function loadClock() {
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const seconds = new Date().getSeconds();
    clock.innerHTML =
      '<p class="clock_time">' +
      hours
        .toString()
        .replace("0", "O")
        .padStart(2, "O")
        .split("")
        .join('</p><p class="clock_time">') +
      '</p><p>:</p><p class="clock_time">' +
      minutes
        .toString()
        .replace("0", "O")
        .padStart(2, "O")
        .split("")
        .join('</p><p class="clock_time">') +
      "</p>" +
      (showSeconds
        ? '<p>:</p><p class="clock_time">' +
          seconds
            .toString()
            .replace("0", "O")
            .padStart(2, "O")
            .split("")
            .join('</p><p class="clock_time">')
        : "") +
      "</p>";
  }

  loadDate();
  loadClock();
  clockInterval = setInterval(loadClock, showSeconds ? 200 : 5000);

  // global change listener
  changeListener.push((changes) => {
    if (changes.showDate !== undefined) {
      showDate = changes.showDate.newValue;
      loadDate();
    }
    if (changes.showSeconds !== undefined) {
      showSeconds = changes.showSeconds.newValue;
      clearInterval(clockInterval);
      loadClock();
      clockInterval = setInterval(loadClock, showSeconds ? 200 : 5000);
    }
  });
}

clockInit();
