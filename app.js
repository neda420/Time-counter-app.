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

function getUTCOffsetForTimezone(timezone) {
  try {
    const date = new Date();
    
    // Get the time string in the target timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    
    const tzTimeStr = formatter.format(date);
    const [tzHours, tzMinutes] = tzTimeStr.split(":").slice(0, 2).map(Number);
    
    // Get UTC time
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    
    // Calculate the offset in total minutes
    let offsetMinutes = (tzHours * 60 + tzMinutes) - (utcHours * 60 + utcMinutes);
    
    // Handle day boundary crossings (UTC offsets range from UTC-12 to UTC+14)
    if (offsetMinutes > 14 * 60) {
      offsetMinutes -= 24 * 60;
    } else if (offsetMinutes < -12 * 60) {
      offsetMinutes += 24 * 60;
    }
    
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absOffsetMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absOffsetMinutes / 60);
    const minutes = absOffsetMinutes % 60;
    
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
  
  const offset = getUTCOffsetForTimezone(selectedTimezone);
  utcOffsetDisplay.textContent = `UTC Offset: ${offset}`;
}

function convertTime() {
  const timeInput = converterTimeInput.value;
  const sourceTimezone = sourceTimezoneSelect.value;
  
  if (!timeInput) {
    conversionResultsContainer.innerHTML = '<p style="color: #999;">Please enter a time</p>';
    return;
  }
  
  try {
    const timeParts = timeInput.split(":").map(Number);
    if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
      conversionResultsContainer.innerHTML = '<p style="color: #999;">Invalid time format</p>';
      return;
    }
    
    const [inputHours, inputMinutes] = timeParts;
    
    // Validate hours and minutes ranges
    if (inputHours < 0 || inputHours > 23 || inputMinutes < 0 || inputMinutes > 59) {
      conversionResultsContainer.innerHTML = '<p style="color: #999;">Invalid time values</p>';
      return;
    }
    
    // Create a reference date (using today's date)
    const referenceDate = new Date();
    
    // Get current time in source timezone to determine offset
    const sourceFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: sourceTimezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    
    const sourceTimeStr = sourceFormatter.format(referenceDate);
    const sourceTimeParts = sourceTimeStr.split(":").slice(0, 2).map(Number);
    const [sourceHours, sourceMinutes] = sourceTimeParts;
    
    // Get current UTC time
    const utcHours = referenceDate.getUTCHours();
    const utcMinutes = referenceDate.getUTCMinutes();
    
    // Calculate source timezone offset in total minutes
    let sourceOffsetMinutes = (sourceHours * 60 + sourceMinutes) - (utcHours * 60 + utcMinutes);
    
    // Handle day boundary crossings (UTC offsets range from UTC-12 to UTC+14)
    if (sourceOffsetMinutes > 14 * 60) {
      sourceOffsetMinutes -= 24 * 60;
    } else if (sourceOffsetMinutes < -12 * 60) {
      sourceOffsetMinutes += 24 * 60;
    }
    
    // Create UTC time from input time by subtracting the timezone offset
    let totalInputMinutes = inputHours * 60 + inputMinutes;
    let totalUTCMinutes = totalInputMinutes - sourceOffsetMinutes;
    
    // Handle day boundaries for the conversion
    while (totalUTCMinutes < 0) {
      totalUTCMinutes += 24 * 60;
    }
    while (totalUTCMinutes >= 24 * 60) {
      totalUTCMinutes -= 24 * 60;
    }
    
    const utcHoursForInput = Math.floor(totalUTCMinutes / 60);
    const utcMinutesForInput = totalUTCMinutes % 60;
    
    // Create a date with UTC time
    const conversionDate = new Date(referenceDate);
    conversionDate.setUTCHours(utcHoursForInput, utcMinutesForInput, 0, 0);
    
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
      
      const time = formatter.format(conversionDate);
      const offset = getUTCOffsetForTimezone(tz);
      
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
