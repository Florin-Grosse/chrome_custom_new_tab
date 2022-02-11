async function clockInit() {
  let { showSeconds, showDate, showTime, dateFormat, language, clockFormat } =
    await getStorageValue([
      "showSeconds",
      "showDate",
      "showTime",
      "dateFormat",
      "language",
      "clockFormat",
    ]);

  if (showSeconds === undefined) {
    setStorageValue({ showSeconds: false });
    showSeconds = false;
  }

  if (showDate === undefined) {
    setStorageValue({ showDate: true });
    showDate = false;
  }

  if (showTime === undefined) {
    setStorageValue({ showTime: true });
    showTime = true;
  }

  if (dateFormat === undefined) {
    setStorageValue({ dateFormat: "default" });
    dateFormat = "default";
  }

  if (clockFormat === undefined) {
    setStorageValue({ clockFormat: "am/pm" });
    clockFormat = "12h";
  }

  if (language === undefined) {
    setStorageValue({ language: "en" });
    language = "en";
  }

  const date = document.getElementById("date");
  function loadDate() {
    if (showDate) {
      date.style.display = "";
      date.textContent =
        languages[language].weekdays[new Date().getDay()] +
        ", " +
        stringifyDate(new Date());
    } else date.style.display = "none";
    updateVisibility();
  }

  const clock = document.getElementById("clock");
  let clockInterval;
  function loadClock() {
    clock.classList.toggle("seconds", showSeconds);
    const now = new Date();
    let hours = now.getHours().toString().replace("0", "O").padStart(2, "O");
    const minutes = now
      .getMinutes()
      .toString()
      .replace("0", "O")
      .padStart(2, "O");
    const seconds = now
      .getSeconds()
      .toString()
      .replace("0", "O")
      .padStart(2, "O");
    const digitElements = clock.querySelectorAll(".clock_time");

    if (clockFormat === "am/pm") {
      const ampmEle = clock.querySelector(".ampm");
      const am = now.getHours() > 0 && now.getHours() < 13;
      hours = (now.getHours() + 24 - (am ? 0 : 12)) % 24;
      hours = hours.toString().replace("0", "O").padStart(2, " ");

      ampmEle.textContent = am ? "am" : "pm";
    }
    const time = hours + minutes + (showSeconds ? seconds : "");

    for (let i = 0; i < time.length; i++) {
      digitElements[i].textContent = time[i];
    }
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

  function stringifyDate(date) {
    const day = date.getDay().toString().padStart(2, "0");
    const month = date.getMonth().toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    let format = dateFormats[dateFormat];
    format = format.replace("dd", day);
    format = format.replace("mm", month);
    format = format.replace("yy", year);
    return format;
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
    if (changes.dateFormat !== undefined) {
      dateFormat = changes.dateFormat.newValue;
      loadDate();
    }
    if (changes.clockFormat !== undefined) {
      clockFormat = changes.clockFormat.newValue;
      clock.querySelector(".ampm").textContent = "";
      loadClock();
    }
    if (changes.language !== undefined) {
      language = changes.language.newValue;
      loadDate();
    }
  });
}

clockInit();
