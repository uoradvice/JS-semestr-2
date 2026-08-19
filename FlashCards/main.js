const STORAGE_KEY = "flashcards_app";
let appData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

if (!appData) {
  appData = {
    decks: {},
    currentDeck: null,
  };
}

function saveAppData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function getCurrentDeck() {
  if (!appData.currentDeck) return [];
  return appData.decks[appData.currentDeck];
}

const frontCard = document.querySelector("#front");
const backCard = document.querySelector("#back");
const addButton = document.querySelector("#addCardButton");
const tbody = document.querySelector("tbody");

const deckSelect = document.querySelector("#deckSelect");
const createDeckBtn = document.querySelector("#createDeckBtn");
const newDeckNameInput = document.querySelector("#newDeckName");

function updateDeckSelect() {
  deckSelect.innerHTML = "";

  Object.keys(appData.decks).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    deckSelect.appendChild(option);
  });

  if (appData.currentDeck) {
    deckSelect.value = appData.currentDeck;
  }

  showCards();
}

createDeckBtn.addEventListener("click", () => {
  const name = newDeckNameInput.value.trim();
  if (!name) return;

  if (appData.decks[name]) {
    alert("Deck already exists");
    return;
  }

  appData.decks[name] = [];
  appData.currentDeck = name;

  newDeckNameInput.value = "";

  saveAppData();
  updateDeckSelect();
});

deckSelect.addEventListener("change", (e) => {
  appData.currentDeck = e.target.value;
  saveAppData();
  showCards();
});

addButton.addEventListener("click", handleAddCard);

function handleAddCard() {
  if (!appData.currentDeck) {
    alert("Create or select a deck first");
    return;
  }

  const frontValue = frontCard.value.trim();
  const backValue = backCard.value.trim();

  if (!frontValue || !backValue) {
    alert("Enter both fields");
    return;
  }

  const card = {
    id: Date.now(),
    front: frontValue,
    back: backValue,
    learned: false,
  };

  getCurrentDeck().push(card);

  frontCard.value = "";
  backCard.value = "";

  saveAppData();
  showCards();
}

function showCards() {
  const deck = getCurrentDeck();
  tbody.innerHTML = "";

  deck.forEach((card) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${card.front}</td>
      <td>${card.back}</td>
      <td>
        <input
          type="checkbox"
          class="learnedChBx"
          data-id="${card.id}"
          ${card.learned ? "checked" : ""}
        >
      </td>
      <td>
        <button class="deleteBtn" data-id="${card.id}">Delete</button>
      </td>
      <td>
        <button class="editBtn" data-id="${card.id}">Edit</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

tbody.addEventListener("click", function (event) {
  const id = Number(event.target.dataset.id);
  const deck = getCurrentDeck();

  if (event.target.classList.contains("deleteBtn")) {
    appData.decks[appData.currentDeck] =
      deck.filter((card) => card.id !== id);

    saveAppData();
    showCards();
  }

  if (event.target.classList.contains("editBtn")) {
    const card = deck.find((card) => card.id === id);
    if (!card) return;

    frontCard.value = card.front;
    backCard.value = card.back;

    appData.decks[appData.currentDeck] =
      deck.filter((card) => card.id !== id);

    saveAppData();
    showCards();
  }

  if (event.target.classList.contains("learnedChBx")) {
    const card = deck.find((card) => card.id === id);
    if (!card) return;

    card.learned = event.target.checked;

    saveAppData();
    showCards();
  }
});

let deckStudyMode = [];
let currentIndex = 0;
let isFront = true;
let isStudyOnlyUnlearned = false;

const startBtn = document.querySelector("#startBtn");
const shuffleBtn = document.querySelector("#shuffle");
const onlyUnlearnedBtn = document.querySelector("#onlyUnlearned");

const flip = document.querySelector("#flip");
const prev = document.querySelector("#prev");
const next = document.querySelector("#next");
const cardDisplay = document.querySelector("#cardDisplay");

startBtn.addEventListener("click", () => {
  preparePlay();
  handlePlay();
});

shuffleBtn.addEventListener("click", () => {
  shuffleDeck();
  handlePlay();
});

onlyUnlearnedBtn.addEventListener("change", (e) => {
  isStudyOnlyUnlearned = e.target.checked;
  preparePlay();
  handlePlay();
});

flip.addEventListener("click", () => {
  isFront = !isFront;
  handlePlay();
});

prev.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    handlePlay();
  }
});

next.addEventListener("click", () => {
  if (currentIndex < deckStudyMode.length - 1) {
    currentIndex++;
    handlePlay();
  }
});

function preparePlay() {
  const deck = getCurrentDeck();

  if (isStudyOnlyUnlearned) {
    deckStudyMode = deck.filter((card) => !card.learned);
  } else {
    deckStudyMode = [...deck];
  }

  currentIndex = 0;
  isFront = true;
}

function shuffleDeck() {
  for (let i = deckStudyMode.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deckStudyMode[i], deckStudyMode[j]] =
      [deckStudyMode[j], deckStudyMode[i]];
  }
}

function handlePlay() {
  if (deckStudyMode.length === 0) {
    cardDisplay.textContent = "No cards in this deck";
    return;
  }

  const card = deckStudyMode[currentIndex];

  cardDisplay.textContent = isFront
    ? card.front
    : card.back;
}

updateDeckSelect();