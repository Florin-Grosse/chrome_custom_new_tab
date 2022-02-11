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
    setStorageValue({ showDate: true });
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
      date.textContent =
        ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][new Date().getDay()] +
        ", " +
        stringifyDate(new Date());
    } else date.style.display = "none";
    updateVisibility();
  }

  const clock = document.getElementById("clock");
  let clockInterval;
  function loadClock() {
    clock.classList.toggle("seconds", showSeconds);
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const seconds = new Date().getSeconds();
    const digitElements = clock.querySelectorAll(".clock_time");
    const time =
      hours.toString().replace("0", "O").padStart(2, "O") +
      minutes.toString().replace("0", "O").padStart(2, "O") +
      (showSeconds
        ? seconds.toString().replace("0", "O").padStart(2, "O")
        : "");
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
    return `${date.getDay().toString().padStart(2, "0")}.${date
      .getMonth()
      .toString()
      .padStart(2, "0")}.${date.getFullYear().toString().slice(-2)}`;
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
