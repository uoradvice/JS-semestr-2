import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import DeckManager from "./components/DeckManager";
import CardForm from "./components/CardForm";
import CardList from "./components/CardList";
import StudyMode from "./components/StudyMode";

const STORAGE_KEY = "flashcards_app";

const decodeHtmlEntities = (text) => {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
};

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const fetchTriviaQuestions = async (amount = 50) => {
  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}`,
    );
    const data = await response.json();

    if (data.response_code === 0 && data.results) {
      return data.results.map((question, index) => ({
        id: generateUniqueId(),
        front: decodeHtmlEntities(question.question),
        back: decodeHtmlEntities(question.correct_answer),
        learned: false,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching trivia questions:", error);
    return [];
  }
};

function App() {
  const [decks, setDecks] = useState({});
  const [currentDeck, setCurrentDeck] = useState("");
  const [newDeckName, setNewDeckName] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [studyDeck, setStudyDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFront, setIsFront] = useState(true);
  const [onlyUnlearned, setOnlyUnlearned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsedData = JSON.parse(saved);
        setDecks(parsedData.decks || {});
        setCurrentDeck(parsedData.currentDeck || "");
        setNewDeckName(parsedData.newDeckName || "");
        setFront(parsedData.front || "");
        setBack(parsedData.back || "");
        setStudyDeck(parsedData.studyDeck || []);
        setCurrentIndex(parsedData.currentIndex || 0);
        setIsFront(
          parsedData.isFront !== undefined ? parsedData.isFront : true,
        );
        setOnlyUnlearned(parsedData.onlyUnlearned || false);
      } else {
        const triviaCards = await fetchTriviaQuestions(50);
        if (triviaCards.length > 0) {
          const initialDecks = {
            "Trivia Deck": triviaCards,
          };
          setDecks(initialDecks);
          setCurrentDeck("Trivia Deck");
        }
      }

      setIsLoading(false);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const stateToSave = {
        decks,
        currentDeck,
        newDeckName,
        front,
        back,
        studyDeck,
        currentIndex,
        isFront,
        onlyUnlearned,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [
    decks,
    currentDeck,
    newDeckName,
    front,
    back,
    studyDeck,
    currentIndex,
    isFront,
    onlyUnlearned,
    isLoading,
  ]);

  const handleDeckNameChange = useCallback((newDeckName) => {
    setNewDeckName(newDeckName);
  }, []);

  const handleCreateDeck = useCallback(() => {
    const name = newDeckName.trim();
    if (!name) return;

    if (decks[name]) {
      alert("Deck already exists");
      return;
    }

    setDecks((prev) => ({
      ...prev,
      [name]: [],
    }));
    setCurrentDeck(name);
    setNewDeckName("");
  }, [newDeckName, decks]);

  const handleSelectDeck = useCallback((currentDeck) => {
    setCurrentDeck(currentDeck);
  }, []);

  const handleFrontChange = useCallback((front) => {
    setFront(front);
  }, []);

  const handleBackChange = useCallback((back) => {
    setBack(back);
  }, []);

  const handleAddCard = useCallback(() => {
    if (!currentDeck) {
      alert("Select deck first");
      return;
    }

    if (!front || !back) {
      alert("Fill both fields");
      return;
    }

    const newCard = {
      id: generateUniqueId(),
      front,
      back,
      learned: false,
    };

    setDecks((prev) => ({
      ...prev,
      [currentDeck]: [...prev[currentDeck], newCard],
    }));
    setFront("");
    setBack("");
  }, [currentDeck, front, back]);

  const handleDeleteCard = useCallback(
    (id) => {
      setDecks((prev) => ({
        ...prev,
        [currentDeck]: prev[currentDeck].filter((c) => c.id !== id),
      }));
    },
    [currentDeck],
  );

  const handleToggleLearned = useCallback(
    (id, learned) => {
      setDecks((prev) => ({
        ...prev,
        [currentDeck]: prev[currentDeck].map((c) =>
          c.id === id ? { ...c, learned } : c,
        ),
      }));
    },
    [currentDeck],
  );

  const handleEditCard = useCallback(
    (card) => {
      setFront(card.front);
      setBack(card.back);
      handleDeleteCard(card.id);
    },
    [handleDeleteCard],
  );

  const handleToggleOnlyUnlearned = useCallback((onlyUnlearned) => {
    setOnlyUnlearned(onlyUnlearned);
  }, []);

  const handleStartStudy = useCallback(() => {
    const deck = decks[currentDeck] || [];

    const filtered = onlyUnlearned ? deck.filter((c) => !c.learned) : deck;

    setStudyDeck(filtered);
    setCurrentIndex(0);
    setIsFront(true);
  }, [decks, currentDeck, onlyUnlearned]);

  const handleFlip = useCallback(() => {
    setIsFront((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < studyDeck.length - 1) {
        setIsFront(true);
        return prev + 1;
      }
      return prev;
    });
  }, [studyDeck.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        setIsFront(true);
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleShuffle = useCallback(() => {
    setStudyDeck((prev) => {
      const shuffled = [...prev];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      setCurrentIndex(0);
      return shuffled;
    });
  }, []);

  const currentCards = decks[currentDeck] || [];

  if (isLoading) {
    return <div className="App">Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Flashcards</h1>
      <DeckManager
        newDeckName={newDeckName}
        currentDeck={currentDeck}
        decks={decks}
        onDeckNameChange={handleDeckNameChange}
        onCreateDeck={handleCreateDeck}
        onSelectDeck={handleSelectDeck}
      />
      <CardForm
        front={front}
        back={back}
        hasCurrentDeck={!!currentDeck}
        onFrontChange={handleFrontChange}
        onBackChange={handleBackChange}
        onAddCard={handleAddCard}
      />
      <CardList
        cards={currentCards}
        onToggleLearned={handleToggleLearned}
        onDeleteCard={handleDeleteCard}
        onEditCard={handleEditCard}
      />
      <StudyMode
        onlyUnlearned={onlyUnlearned}
        studyDeck={studyDeck}
        currentIndex={currentIndex}
        isFront={isFront}
        onToggleOnlyUnlearned={handleToggleOnlyUnlearned}
        onStartStudy={handleStartStudy}
        onFlip={handleFlip}
        onNext={handleNext}
        onPrev={handlePrev}
        onShuffle={handleShuffle}
      />
    </div>
  );
}

export default App;
