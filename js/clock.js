async function clockInit() {
  let { showSeconds, showDate, showTime } = await getStorageValue([
    "showSeconds",
    "showDate",
    "showTime",
  ]);

  if (showSeconds === undefined) {
    setStorageValue({ showSeconds: false });
    showSeconds = false;
  }

  if (showDate === undefined) {
    setStorageValue({ showSeconds: true });
    showDate = false;
  }

  if (showTime === undefined) {
    setStorageValue({ showTime: true });
    showTime = true;
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
    updateVisibility();
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
    loadDate();
  }

  function clockVisibility() {
    if (showTime) clock.style.display = null;
    else clock.style.display = "none";
    updateVisibility();
  }

  const timeWrapper = document.getElementById("time_wrapper");
  function updateVisibility() {
    if (!showTime && !showDate) timeWrapper.style.display = "none";
    else timeWrapper.style.display = null;
  }

  loadDate();
  loadClock();
  clockVisibility();
  clockInterval = showTime
    ? setInterval(loadClock, showSeconds ? 200 : 5000)
    : undefined;

  // global change listener
  changeListener.push((changes) => {
    if (changes.showDate !== undefined) {
      showDate = changes.showDate.newValue;
      loadDate();
    }
    if (changes.showTime !== undefined) {
      showTime = changes.showTime.newValue;
      clockVisibility();
    }
    if (changes.showSeconds !== undefined) {
      showSeconds = changes.showSeconds.newValue;
      clearInterval(clockInterval);
      loadClock();
      clockInterval = showTime
        ? setInterval(loadClock, showSeconds ? 200 : 5000)
        : undefined;
    }
  });
}

clockInit();
