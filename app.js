const stopwatchDisplay = document.getElementById("stopwatch-display");
const startStopwatchBtn = document.getElementById("start-stopwatch");
const pauseStopwatchBtn = document.getElementById("pause-stopwatch");
const resetStopwatchBtn = document.getElementById("reset-stopwatch");

const countdownInput = document.getElementById("countdown-input");
const countdownDisplay = document.getElementById("countdown-display");
const startCountdownBtn = document.getElementById("start-countdown");
const resetCountdownBtn = document.getElementById("reset-countdown");

const clockDisplay = document.getElementById("clock-display");

let stopwatchSeconds = 0;
let stopwatchTimer = null;

let countdownSeconds = Number(countdownInput.value) || 60;
let countdownTimer = null;

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
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

startStopwatchBtn.addEventListener("click", startStopwatch);
pauseStopwatchBtn.addEventListener("click", pauseStopwatch);
resetStopwatchBtn.addEventListener("click", resetStopwatch);

startCountdownBtn.addEventListener("click", startCountdown);
resetCountdownBtn.addEventListener("click", resetCountdown);
countdownInput.addEventListener("change", resetCountdown);

renderStopwatch();
renderCountdown();
renderClock();
setInterval(renderClock, 1000);
