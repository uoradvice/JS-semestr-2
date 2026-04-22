let startBth = document.querySelector("#startBtn");
let statusEl = document.querySelector("#status");
let levelEl = document.querySelector("#level");
let bestEl = document.querySelector("#best");
let cards = [...document.querySelectorAll(".card")];
const board = document.querySelector("#board");
let scoresEl = document.querySelector(".scores");

const BEST_KEY = "simon_best";
// localStorage.setItem(BEST_KEY, String(0));
let bestScore = 0;
let sequence = [];
let phase = "idle";
let playerPos = 0;
let clickLock = false;

levelEl.textContent = "0";
bestScore = Number(localStorage.getItem(BEST_KEY)) || 0;
bestEl.textContent = String(bestScore);

startBth.addEventListener("click", handlePlay);

board.addEventListener("click", async (event) => {
  const currentCard = event.target.closest(".card");
  if (!currentCard) return;
  if (phase !== "player") return;
  if (clickLock) return;

  clickLock = true;
  await playerTurn(Number(currentCard.dataset.idx));
  clickLock = false;
});

async function handlePlay() {
  if (phase === "player" || phase === "showing") return;
  scoresEl.classList.remove("hidden");
  startBth.disabled = true;
  phase = "startGame";
  sequence = [];
  levelEl.textContent = "0";
  statusEl.textContent = "New Game";

  await sleep(600);
  await nextRound();
}

async function nextRound() {
  playerPos = 0;
  phase = "showing";
  cards.forEach((el) => {
    el.classList.add("disabled");
  });

  fillSequence();
  levelEl.textContent = String(sequence.length);
  updateBest(sequence.length);

  await status();
  await playSequence();

  cards.forEach((el) => {
    el.classList.remove("disabled");
  });

  phase = "player";
  statusEl.textContent = "Your turn";
}

async function playSequence() {
  for (let i = 0; i < sequence.length; i++) {
    await flashCard(sequence[i]);
    await sleep(500);
  }
}

async function playerTurn(clickedId) {
  const expectedId = sequence[playerPos];

  if (clickedId !== expectedId) {
    await gameOver();
    return;
  }

  playerPos++;

  if (playerPos === sequence.length) {
    statusEl.textContent = "Good, lets go next";

    phase = "showing";
    cards.forEach((el) => {
      el.classList.add("disabled");
    });

    await sleep(600);
    await nextRound();
  }
}

function fillSequence() {
  sequence.push(Math.floor(Math.random() * cards.length));
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function status() {
  statusEl.textContent = " -- ready --";
  await sleep(500);

  statusEl.textContent = "-- set --";
  await sleep(500);

  statusEl.textContent = "-- go --";
  await sleep(500);
  statusEl.textContent = "";
}

function updateBest(score) {
  if (score > bestScore) {
    bestScore = score;
    bestEl.textContent = String(bestScore);
    localStorage.setItem(BEST_KEY, String(bestScore));
  }
}

async function flashCard(idx, ms = 600) {
  const card = cards[idx];

  card.classList.add("active");
  await sleep(ms);
  card.classList.remove("active");
}

async function gameOver() {
  statusEl.textContent = `GAME OVER. \nLevel: ${sequence.length} \nBest Score: ${bestScore}`;
  scoresEl.classList.add("hidden");
  phase = "gameover";
  startBth.disabled = false;
  cards.forEach((el) => {
    el.classList.add("disabled");
  });
}
