/*********************************
 * Rage House Scoring V2
 * New flow:
 * - Staff unlocks
 * - Staff enters names/timer/rounds/throws
 * - Customers choose game
 * - Timer ending locks system
 *********************************/

const STAFF_PIN = "1234";

const GAMES = [
  {
    id: "ducks",
    name: "Ducks",
    image: "images/ducks.png",
    baseW: 1024,
    baseH: 1024,
    buttons: [
      { score: 1,  x: 370, y: 403 },
      { score: 2,  x: 462, y: 485 },
      { score: 6,  x: 598, y: 397 },
      { score: 7,  x: 384, y: 553 },
      { score: 3,  x: 473, y: 606 },
      { score: 5,  x: 615, y: 569 },
      { score: 10, x: 665, y: 635 },
      { score: 4,  x: 571, y: 680 },
      { score: 8,  x: 396, y: 701 },
      { score: 9,  x: 336, y: 633 }
    ]
  },
  {
    id: "axe-classic",
    name: "Axe Classic",
    image: "images/axe-classic.png",
    baseW: 1024,
    baseH: 1024,
    buttons: [
      { score: 7, x: 327, y: 284 },
      { score: 7, x: 724, y: 282 },
      { score: 1, x: 359, y: 457 },
      { score: 3, x: 434, y: 487 },
      { score: 5, x: 514, y: 522 }
    ]
  },
  {
    id: "darts",
    name: "Darts",
    image: "images/darts.png",
    baseW: 1024,
    baseH: 1024,
    buttons: [
      { score: 20, x: 509, y: 324 },
      { score: 1,  x: 566, y: 334 },
      { score: 18, x: 617, y: 362 },
      { score: 4,  x: 649, y: 401 },
      { score: 13, x: 670, y: 451 },
      { score: 6,  x: 677, y: 497 },
      { score: 10, x: 678, y: 548 },
      { score: 15, x: 650, y: 598 },
      { score: 2,  x: 612, y: 642 },
      { score: 17, x: 565, y: 660 },
      { score: 3,  x: 510, y: 671 },
      { score: 19, x: 456, y: 666 },
      { score: 7,  x: 408, y: 642 },
      { score: 16, x: 367, y: 602 },
      { score: 8,  x: 384, y: 546 },
      { score: 11, x: 340, y: 498 },
      { score: 14, x: 341, y: 441 },
      { score: 9,  x: 369, y: 395 },
      { score: 12, x: 411, y: 357 },
      { score: 5,  x: 452, y: 333 }
    ]
  },
  {
    id: "zombie",
    name: "Zombie",
    image: "images/zombie.png",
    baseW: 1024,
    baseH: 1024,
    buttons: [
      { score: 10, x: 537, y: 316 },
      { score: 1,  x: 395, y: 328 },
      { score: 2,  x: 477, y: 435 },
      { score: 2,  x: 533, y: 437 },
      { score: 2,  x: 404, y: 458 },
      { score: 3,  x: 517, y: 515 },
      { score: 2,  x: 604, y: 487 },
      { score: 2,  x: 550, y: 563 },
      { score: 2,  x: 486, y: 570 },
      { score: 2,  x: 523, y: 627 },
      { score: 2,  x: 649, y: 630 },
      { score: 2,  x: 586, y: 690 },
      { score: 2,  x: 471, y: 702 },
      { score: 2,  x: 640, y: 720 }
    ]
  },
  {
    id: "speed-round",
    name: "Speed Round",
    image: "images/speed-round.png",
    baseW: 1024,
    baseH: 1024,
    buttons: [
      { score: 1,  x: 300, y: 300 },
      { score: 2,  x: 450, y: 420 },
      { score: 3,  x: 512, y: 512 },
      { score: 5,  x: 650, y: 420 },
      { score: 10, x: 720, y: 300 }
    ]
  },
  {
    id: "noughts-crosses",
    name: "Noughts & Crosses",
    image: "images/noughts-crosses.png",
    baseW: 1024,
    baseH: 1024,
    buttons: [
      { score: 1, x: 280, y: 280 },
      { score: 1, x: 512, y: 280 },
      { score: 1, x: 744, y: 280 },
      { score: 1, x: 280, y: 512 },
      { score: 1, x: 512, y: 512 },
      { score: 1, x: 744, y: 512 },
      { score: 1, x: 280, y: 744 },
      { score: 1, x: 512, y: 744 },
      { score: 1, x: 744, y: 744 }
    ]
  }
];

const KEY_STATE = "rh_scoring_v2_customer_game_select";

let staffUnlocked = false;
let undoStack = [];
let timerInterval = null;

let state = loadState() ?? {
  lane: "Lane 1",
  gameId: null,
  sessionStarted: false,
  sessionEnded: false,
  rounds: 3,
  throwsPerRound: 7,
  players: ["Player 1", "Player 2"],
  throws: [],
  timerRunning: false,
  timerEndsAt: null,
  timerMinutes: 60
};

/* DOM */
const navChooseGame = document.getElementById("navChooseGame");
const navScoreboard = document.getElementById("navScoreboard");
const navStaffSetup = document.getElementById("navStaffSetup");

const pageChooseGame = document.getElementById("pageChooseGame");
const pageScoreboard = document.getElementById("pageScoreboard");
const pageStaffSetup = document.getElementById("pageStaffSetup");

const gameCards = document.getElementById("gameCards");
const chooseGameHelp = document.getElementById("chooseGameHelp");

const unlockBtn = document.getElementById("unlockBtn");
const kioskBtn = document.getElementById("kioskBtn");

const pinModal = document.getElementById("pinModal");
const pinInput = document.getElementById("pinInput");
const pinOkBtn = document.getElementById("pinOkBtn");
const pinCancelBtn = document.getElementById("pinCancelBtn");
const pinMsg = document.getElementById("pinMsg");

const laneSelect = document.getElementById("laneSelect");
const roundsInput = document.getElementById("roundsInput");
const throwsInput = document.getElementById("throwsInput");
const timerMinutesInput = document.getElementById("timerMinutesInput");

const playersList = document.getElementById("playersList");
const newPlayerName = document.getElementById("newPlayerName");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const startSessionBtn = document.getElementById("startSessionBtn");
const startNewGameBtn = document.getElementById("startNewGameBtn");

const undoBtn = document.getElementById("undoBtn");
const missBtn = document.getElementById("missBtn");
const missOnBoardBtn = document.getElementById("missOnBoardBtn");

const targetStage = document.getElementById("targetStage");
const gameImage = document.getElementById("gameImage");
const overlay = document.getElementById("overlay");

const scoreboardEl = document.getElementById("scoreboard");
const statusText = document.getElementById("statusText");

const laneLabel = document.getElementById("laneLabel");
const timerLabel = document.getElementById("timerLabel");

const sessionEndedOverlay = document.getElementById("sessionEndedOverlay");

init();

function init() {
  laneSelect.value = state.lane;
  roundsInput.value = state.rounds;
  throwsInput.value = state.throwsPerRound;
  timerMinutesInput.value = state.timerMinutes;

  laneLabel.textContent = state.lane;

  renderGameCards();
  renderPlayersEditor();
  renderScoreboard();
  renderTargetIfGameSelected();
  resumeTimer();

  setStaffUnlocked(false);

  if (state.sessionEnded) {
    showSessionEndedOverlay();
  } else {
    hideSessionEndedOverlay();
  }

  showPage("choose");

  navChooseGame.addEventListener("click", () => showPage("choose"));
  navScoreboard.addEventListener("click", () => showPage("scoreboard"));
  navStaffSetup.addEventListener("click", () => {
    if (staffUnlocked) showPage("staff");
  });

  unlockBtn.addEventListener("click", openPinModal);
  pinCancelBtn.addEventListener("click", closePinModal);
  pinOkBtn.addEventListener("click", tryUnlock);
  pinInput.addEventListener("keydown", e => {
    if (e.key === "Enter") tryUnlock();
  });

  addPlayerBtn.addEventListener("click", addPlayer);
  startSessionBtn.addEventListener("click", startSession);
  startNewGameBtn.addEventListener("click", resetSession);

  undoBtn.addEventListener("click", undo);
  missBtn.addEventListener("click", () => addScore(0));
  missOnBoardBtn.addEventListener("click", () => addScore(0));

  overlay.addEventListener("click", e => {
    if (state.sessionEnded) return;
    if (!state.sessionStarted) return;
    if (!state.gameId) return;

    const btn = e.target.closest(".scoreBtn");
    if (!btn) return;

    const score = Number(btn.dataset.score);
    if (!Number.isFinite(score)) return;

    addScore(score);
  });

  kioskBtn.addEventListener("click", enterFullscreen);

  window.addEventListener("resize", () => {
    const g = currentGame();
    if (g) fitOverlayToContainedImage(g.baseW || 1024, g.baseH || 1024);
  });
}

function showPage(which) {
  pageChooseGame.style.display = which === "choose" ? "" : "none";
  pageScoreboard.style.display = which === "scoreboard" ? "" : "none";
  pageStaffSetup.style.display = which === "staff" ? "" : "none";

  navChooseGame.classList.toggle("active", which === "choose");
  navScoreboard.classList.toggle("active", which === "scoreboard");
  navStaffSetup.classList.toggle("active", which === "staff");
}

/* Staff */
function openPinModal() {
  pinMsg.textContent = "";
  pinInput.value = "";
  pinModal.style.display = "";
  setTimeout(() => pinInput.focus(), 50);
}

function closePinModal() {
  pinModal.style.display = "none";
}

function tryUnlock() {
  if (pinInput.value === STAFF_PIN) {
    setStaffUnlocked(true);
    closePinModal();
  } else {
    pinMsg.textContent = "Incorrect PIN";
  }
}

function setStaffUnlocked(unlocked) {
  staffUnlocked = unlocked;
  unlockBtn.textContent = unlocked ? "🔓 Staff Unlocked" : "🔒 Staff Locked";

  navStaffSetup.style.display = unlocked ? "" : "none";

  const controls = pageStaffSetup.querySelectorAll("input, select, button");
  controls.forEach(el => {
    el.disabled = !unlocked;
    if (unlocked) el.removeAttribute("disabled");
    else el.setAttribute("disabled", "disabled");
  });

  renderPlayersEditor();

  if (unlocked) showPage("staff");
  else showPage("choose");
}

/* Session setup */
function startSession() {
  if (!staffUnlocked) return;

  state.players = state.players.map(n => (n || "").trim()).filter(Boolean);
  if (state.players.length === 0) state.players = ["Player 1"];

  state.lane = laneSelect.value;
  state.rounds = clampInt(roundsInput.value, 1, 20, 3);
  state.throwsPerRound = clampInt(throwsInput.value, 1, 30, 7);
  state.timerMinutes = clampInt(timerMinutesInput.value, 1, 180, 60);

  state.sessionStarted = true;
  state.sessionEnded = false;
  state.gameId = null;
  state.throws = [];

  state.timerRunning = true;
  state.timerEndsAt = Date.now() + state.timerMinutes * 60 * 1000;

  laneLabel.textContent = state.lane;

  saveState();
  hideSessionEndedOverlay();
  renderGameCards();
  renderPlayersEditor();
  renderScoreboard();
  resumeTimer();
  showPage("choose");
}

function resetSession() {
  if (!staffUnlocked) return;

  state.sessionStarted = false;
  state.sessionEnded = false;
  state.gameId = null;
  state.throws = [];
  state.timerRunning = false;
  state.timerEndsAt = null;

  saveState();
  hideSessionEndedOverlay();
  renderGameCards();
  renderScoreboard();
  renderTargetIfGameSelected();
  renderTimer();
  showPage("staff");
}

/* Players */
function renderPlayersEditor() {
  playersList.innerHTML = "";

  state.players.forEach((name, idx) => {
    const row = document.createElement("div");
    row.className = "playerRow";

    const input = document.createElement("input");
    input.value = name;
    input.disabled = !staffUnlocked;

    input.addEventListener("input", () => {
      state.players[idx] = input.value;
      saveState();
      renderScoreboard();
    });

    row.appendChild(input);
    playersList.appendChild(row);
  });
}

function addPlayer() {
  if (!staffUnlocked) return;

  const name = (newPlayerName.value || "").trim();
  if (!name) return;

  state.players.push(name);
  newPlayerName.value = "";

  saveState();
  renderPlayersEditor();
}

/* Game select */
function renderGameCards() {
  chooseGameHelp.textContent = state.sessionEnded
    ? "Session has ended. Please speak to staff."
    : state.sessionStarted
      ? "Choose a game to begin."
      : "Staff must start a session first.";

  gameCards.innerHTML = "";

  GAMES.forEach(game => {
    const card = document.createElement("div");
    card.className = "gameCard";

    if (!state.sessionStarted || state.sessionEnded) {
      card.classList.add("disabled");
    }

    card.innerHTML = `
      <img src="${game.image}" alt="${escapeHtml(game.name)}">
      <div class="gameCardTitle">${escapeHtml(game.name)}</div>
    `;

    card.addEventListener("click", () => {
      if (!state.sessionStarted || state.sessionEnded) return;
      chooseGame(game.id);
    });

    gameCards.appendChild(card);
  });
}

function chooseGame(gameId) {
  if (!state.sessionStarted || state.sessionEnded) return;

  state.gameId = gameId;
  resetScoreboard();
  saveState();

  renderTargetIfGameSelected();
  renderScoreboard();
  showPage("scoreboard");
}

/* Timer */
function resumeTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(renderTimer, 500);
  renderTimer();
}

function renderTimer() {
  if (!state.timerRunning || !state.timerEndsAt) {
    timerLabel.textContent = "Timer: --:--";
    return;
  }

  const remaining = Math.max(0, state.timerEndsAt - Date.now());
  const totalSec = Math.floor(remaining / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  timerLabel.textContent = `Timer: ${mm}:${ss}`;

  if (remaining <= 0) {
    endSessionByTimer();
  }
}

function endSessionByTimer() {
  state.timerRunning = false;
  state.timerEndsAt = null;
  state.sessionEnded = true;
  saveState();

  timerLabel.textContent = "Timer: 00:00 - SESSION ENDED";
  renderGameCards();
  showSessionEndedOverlay();
}

function showSessionEndedOverlay() {
  sessionEndedOverlay.style.display = "flex";
}

function hideSessionEndedOverlay() {
  sessionEndedOverlay.style.display = "none";
}

/* Scoreboard data */
function resetScoreboard() {
  state.throws = Array.from({ length: state.players.length }, () =>
    Array.from({ length: state.rounds }, () =>
      Array.from({ length: state.throwsPerRound }, () => null)
    )
  );
  undoStack = [];
  saveState();
}

function findNextEmpty() {
  if (!Array.isArray(state.throws) || state.throws.length === 0) return null;

  for (let r = 0; r < state.rounds; r++) {
    for (let p = 0; p < state.players.length; p++) {
      for (let t = 0; t < state.throwsPerRound; t++) {
        if (state.throws[p]?.[r]?.[t] == null) return { p, r, t };
      }
    }
  }

  return null;
}

function addScore(score) {
  if (state.sessionEnded) {
    alert("Session has ended. Please speak to staff.");
    return;
  }

  const next = findNextEmpty();
  if (!next) return;

  const prev = state.throws[next.p][next.r][next.t];
  undoStack.push({ ...next, prev });

  state.throws[next.p][next.r][next.t] = score;

  saveState();
  renderScoreboard();
}

function undo() {
  const last = undoStack.pop();
  if (!last) return;

  state.throws[last.p][last.r][last.t] = last.prev;
  saveState();
  renderScoreboard();
}

function roundTotal(p, r) {
  if (!state.throws[p] || !state.throws[p][r]) return 0;
  return state.throws[p][r].reduce((a, b) => a + (b ?? 0), 0);
}

function gameTotal(p) {
  if (!state.throws[p]) return 0;
  return state.throws[p].reduce((sum, roundArr) => {
    return sum + roundArr.reduce((a, b) => a + (b ?? 0), 0);
  }, 0);
}

function renderScoreboard() {
  if (!state.gameId) {
    scoreboardEl.innerHTML = `<div class="muted" style="padding:14px;">No game selected yet.</div>`;
    statusText.textContent = state.sessionStarted
      ? "Choose a game to begin"
      : "Staff must start a session first";
    return;
  }

  if (!Array.isArray(state.throws) || state.throws.length === 0) {
    resetScoreboard();
  }

  const next = findNextEmpty();
  statusText.textContent = next
    ? `Round ${next.r + 1}, Throw ${next.t + 1} — ${state.players[next.p]}`
    : "Game finished";

  let html = `<table><thead>`;
  html += `<tr><th class="stickyLeft" rowspan="2">Player</th>`;

  for (let r = 0; r < state.rounds; r++) {
    html += `<th colspan="${state.throwsPerRound + 1}">Round ${r + 1}</th>`;
  }

  html += `<th class="totalCell" rowspan="2">Total</th></tr>`;
  html += `<tr>`;

  for (let r = 0; r < state.rounds; r++) {
    for (let t = 0; t < state.throwsPerRound; t++) {
      html += `<th>${t + 1}</th>`;
    }
    html += `<th class="totalCell">T</th>`;
  }

  html += `</tr></thead><tbody>`;

  for (let p = 0; p < state.players.length; p++) {
    html += `<tr><td class="stickyLeft">${escapeHtml(state.players[p])}</td>`;

    for (let r = 0; r < state.rounds; r++) {
      for (let t = 0; t < state.throwsPerRound; t++) {
        html += `<td>${state.throws[p]?.[r]?.[t] ?? ""}</td>`;
      }

      html += `<td class="totalCell">${roundTotal(p, r)}</td>`;
    }

    html += `<td class="totalCell">${gameTotal(p)}</td></tr>`;
  }

  html += `</tbody></table>`;
  scoreboardEl.innerHTML = html;
}

/* Target */
function currentGame() {
  if (!state.gameId) return null;
  return GAMES.find(g => g.id === state.gameId) ?? null;
}

function renderTargetIfGameSelected() {
  const g = currentGame();

  if (!g) {
    gameImage.removeAttribute("src");
    overlay.innerHTML = "";
    return;
  }

  renderTarget();
}

function renderTarget() {
  const g = currentGame();
  if (!g) return;

  const baseW = g.baseW || 1024;
  const baseH = g.baseH || 1024;

  gameImage.onload = () => {
    drawOverlayButtons(g, baseW, baseH);
    fitOverlayToContainedImage(baseW, baseH);
  };

  gameImage.src = g.image;

  setTimeout(() => {
    drawOverlayButtons(g, baseW, baseH);
    fitOverlayToContainedImage(baseW, baseH);
  }, 0);
}

function drawOverlayButtons(g, baseW, baseH) {
  overlay.setAttribute("viewBox", `0 0 ${baseW} ${baseH}`);
  overlay.setAttribute("preserveAspectRatio", "xMidYMid meet");

  overlay.innerHTML = "";

  for (const b of g.buttons) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("scoreBtn");
    group.dataset.score = String(b.score);

    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", String(b.x));
    c.setAttribute("cy", String(b.y));
    c.setAttribute("r", "44");

    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", String(b.x));
    t.setAttribute("y", String(b.y));
    t.textContent = String(b.score);

    group.appendChild(c);
    group.appendChild(t);
    overlay.appendChild(group);
  }
}

function fitOverlayToContainedImage(baseW, baseH) {
  const stageW = targetStage.clientWidth;
  const stageH = targetStage.clientHeight;

  const scale = Math.min(stageW / baseW, stageH / baseH);
  const drawW = baseW * scale;
  const drawH = baseH * scale;

  const offsetX = (stageW - drawW) / 2;
  const offsetY = (stageH - drawH) / 2;

  overlay.style.width = `${drawW}px`;
  overlay.style.height = `${drawH}px`;
  overlay.style.left = `${offsetX}px`;
  overlay.style.top = `${offsetY}px`;
}

/* Fullscreen */
async function enterFullscreen() {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch {}
}

/* Helpers */
function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[c]));
}

/* Storage */
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY_STATE) || "null");
  } catch {
    return null;
  }
}

function saveState() {
  localStorage.setItem(KEY_STATE, JSON.stringify(state));
}
