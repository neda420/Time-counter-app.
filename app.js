const stopwatchDisplay = document.getElementById("stopwatch-display");
const startStopwatchBtn = document.getElementById("start-stopwatch");
const pauseStopwatchBtn = document.getElementById("pause-stopwatch");
const resetStopwatchBtn = document.getElementById("reset-stopwatch");

const countdownInput = document.getElementById("countdown-input");
const countdownDisplay = document.getElementById("countdown-display");
const startCountdownBtn = document.getElementById("start-countdown");
const resetCountdownBtn = document.getElementById("reset-countdown");

const clockDisplay = document.getElementById("clock-display");
const timezoneSelect = document.getElementById("timezone-select");
const worldClockDisplay = document.getElementById("world-clock-display");
const utcOffsetDisplay = document.getElementById("utc-offset");
const converterTimeInput = document.getElementById("converter-time-input");
const sourceTimezoneSelect = document.getElementById("source-timezone");
const conversionResultsContainer = document.getElementById("conversion-results");

let stopwatchSeconds = 0;
let stopwatchTimer = null;

let countdownSeconds = Number(countdownInput.value) || 60;
let countdownTimer = null;

// Timezone mapping with UTC offsets (base offsets, DST may vary)
const timezones = {
  "UTC": 0,
  "America/New_York": -5,
  "America/Chicago": -6,
  "America/Denver": -7,
  "America/Los_Angeles": -8,
  "Europe/London": 0,
  "Europe/Paris": 1,
  "Europe/Berlin": 1,
  "Asia/Dubai": 4,
  "Asia/Kolkata": 5.5,
  "Asia/Bangkok": 7,
  "Asia/Singapore": 8,
  "Asia/Hong_Kong": 8,
  "Asia/Tokyo": 9,
  "Asia/Shanghai": 8,
  "Australia/Sydney": 10,
  "Pacific/Auckland": 12
};

const timezoneLabels = {
  "UTC": "UTC (Coordinated Universal Time)",
  "America/New_York": "USA (New York) - EST/EDT",
  "America/Chicago": "USA (Chicago) - CST/CDT",
  "America/Denver": "USA (Denver) - MST/MDT",
  "America/Los_Angeles": "USA (Los Angeles) - PST/PDT",
  "Europe/London": "UK (London) - GMT/BST",
  "Europe/Paris": "France (Paris) - CET/CEST",
  "Europe/Berlin": "Germany (Berlin) - CET/CEST",
  "Asia/Dubai": "UAE (Dubai) - GST",
  "Asia/Kolkata": "India (New Delhi) - IST",
  "Asia/Bangkok": "Thailand (Bangkok) - ICT",
  "Asia/Singapore": "Singapore - SGT",
  "Asia/Hong_Kong": "Hong Kong - HKT",
  "Asia/Tokyo": "Japan (Tokyo) - JST",
  "Asia/Shanghai": "China (Shanghai) - CST",
  "Australia/Sydney": "Australia (Sydney) - AEDT/AEST",
  "Pacific/Auckland": "New Zealand (Auckland) - NZDT/NZST"
};

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatTime12Hour(hours, minutes, seconds) {
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function getTimeForTimezone(timezone) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone
    });
    return formatter.format(new Date());
  } catch (e) {
    return "--:--:--";
  }
}

function getUTCOffsetString(timezone) {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    
    const timezoneTime = new Date(formatter.format(date).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, "$3-$1-$2T$4:$5:$6"));
    const utcTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    
    const offset = (timezoneTime - utcTime) / (1000 * 60 * 60);
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.round((Math.abs(offset) - hours) * 60);
    const sign = offset >= 0 ? "+" : "-";
    
    return `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } catch (e) {
    return "UTC";
  }
}

function renderStopwatch() {
  stopwatchDisplay.textContent = formatTime(stopwatchSeconds);
}

function renderCountdown() {
  countdownDisplay.textContent = formatTime(countdownSeconds);
}

function startStopwatch() {
  if (stopwatchTimer) {
    return;
  }
  stopwatchTimer = setInterval(() => {
    stopwatchSeconds += 1;
    renderStopwatch();
  }, 1000);
}

function pauseStopwatch() {
  if (!stopwatchTimer) {
    return;
  }
  clearInterval(stopwatchTimer);
  stopwatchTimer = null;
}

function resetStopwatch() {
  pauseStopwatch();
  stopwatchSeconds = 0;
  renderStopwatch();
}

function startCountdown() {
  if (countdownTimer || countdownSeconds <= 0) {
    return;
  }
  countdownTimer = setInterval(() => {
    countdownSeconds -= 1;
    renderCountdown();
    if (countdownSeconds <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

function resetCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdownSeconds = Math.max(1, Number(countdownInput.value) || 60);
  renderCountdown();
}

function renderClock() {
  const now = new Date();
  clockDisplay.textContent = now.toLocaleTimeString();
}

function renderWorldClock() {
  const selectedTimezone = timezoneSelect.value;
  const time = getTimeForTimezone(selectedTimezone);
  worldClockDisplay.textContent = time;
  
  const offset = getUTCOffsetString(selectedTimezone);
  utcOffsetDisplay.textContent = `UTC Offset: ${offset}`;
}

function convertTime() {
  const timeInput = converterTimeInput.value;
  const sourceTimezone = sourceTimezoneSelect.value;
  
  if (!timeInput) {
    conversionResultsContainer.innerHTML = '<p style="color: #999;">Please enter a time</p>';
    return;
  }
  
  const [hours, minutes] = timeInput.split(":").map(Number);
  
  try {
    // Create a date object for the source timezone
    const now = new Date();
    
    // Get current time in source timezone
    const sourceFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: sourceTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    
    const sourceParts = sourceFormatter.formatToParts(now);
    const sourceDate = new Date(
      parseInt(sourceParts.find(p => p.type === "year").value),
      parseInt(sourceParts.find(p => p.type === "month").value) - 1,
      parseInt(sourceParts.find(p => p.type === "day").value),
      hours,
      minutes,
      0
    );
    
    // Calculate the offset between source timezone and UTC
    const sourceFormatter2 = new Intl.DateTimeFormat("en-US", {
      timeZone: sourceTimezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    
    const sourceTimeNow = sourceFormatter2.format(now);
    const [sh, sm] = sourceTimeNow.split(":").slice(0, 2).map(Number);
    
    const utcDate = new Date(now);
    const utcHours = utcDate.getUTCHours();
    const utcMinutes = utcDate.getUTCMinutes();
    
    const sourceOffsetMinutes = (sh * 60 + sm) - (utcHours * 60 + utcMinutes);
    const inputDateUTC = new Date(sourceDate.getTime() - sourceOffsetMinutes * 60000);
    
    // Convert to all major timezones
    const allTimezones = Object.keys(timezoneLabels);
    const results = allTimezones.map(tz => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
      
      const time = formatter.format(inputDateUTC);
      const offset = getUTCOffsetString(tz);
      
      return {
        timezone: tz,
        label: timezoneLabels[tz],
        time: time,
        offset: offset
      };
    });
    
    // Render results
    conversionResultsContainer.innerHTML = results.map(result => `
      <div class="timezone-result">
        <div>
          <div class="timezone-result-name">${result.label}</div>
          <div class="timezone-result-offset">${result.offset}</div>
        </div>
        <div class="timezone-result-time">${result.time}</div>
      </div>
    `).join("");
    
  } catch (e) {
    conversionResultsContainer.innerHTML = '<p style="color: #999;">Error converting time</p>';
  }
}

startStopwatchBtn.addEventListener("click", startStopwatch);
pauseStopwatchBtn.addEventListener("click", pauseStopwatch);
resetStopwatchBtn.addEventListener("click", resetStopwatch);

startCountdownBtn.addEventListener("click", startCountdown);
resetCountdownBtn.addEventListener("click", resetCountdown);
countdownInput.addEventListener("change", resetCountdown);

timezoneSelect.addEventListener("change", renderWorldClock);
converterTimeInput.addEventListener("change", convertTime);
sourceTimezoneSelect.addEventListener("change", convertTime);

renderStopwatch();
renderCountdown();
renderClock();
renderWorldClock();

setInterval(() => {
  renderClock();
  renderWorldClock();
}, 1000);
