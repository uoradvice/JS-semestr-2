import React from "react";
import "./App.css";
import DeckManager from "./components/DeckManager";
import CardForm from "./components/CardForm";
import CardList from "./components/CardList";
import StudyMode from "./components/StudyMode";

const STORAGE_KEY = "flashcards_app";

export default class App extends React.Component {
  state = {
    decks: {},
    currentDeck: "",
    newDeckName: "",

    front: "",
    back: "",

    studyDeck: [],
    currentIndex: 0,
    isFront: true,
    onlyUnlearned: false,
  };

  componentDidMount() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.setState(JSON.parse(saved));
    }
  }

  componentDidUpdate() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  handleDeckNameChange = (newDeckName) => {
    this.setState({ newDeckName });
  };

  handleCreateDeck = () => {
    const name = this.state.newDeckName.trim();
    if (!name) return;

    if (this.state.decks[name]) {
      alert("Deck already exists");
      return;
    }

    this.setState((prev) => ({
      decks: { ...prev.decks, [name]: [] },
      currentDeck: name,
      newDeckName: "",
    }));
  };

  handleSelectDeck = (currentDeck) => {
    this.setState({ currentDeck });
  };

  handleFrontChange = (front) => this.setState({ front });
  handleBackChange = (back) => this.setState({ back });

  handleAddCard = () => {
    if (!this.state.currentDeck) {
      alert("Select deck first");
      return;
    }

    if (!this.state.front || !this.state.back) {
      alert("Fill both fields");
      return;
    }

    const newCard = {
      id: Date.now(),
      front: this.state.front,
      back: this.state.back,
      learned: false,
    };

    this.setState((prev) => ({
      decks: {
        ...prev.decks,
        [prev.currentDeck]: [...prev.decks[prev.currentDeck], newCard],
      },
      front: "",
      back: "",
    }));
  };

  handleDeleteCard = (id) => {
    this.setState((prev) => ({
      decks: {
        ...prev.decks,
        [prev.currentDeck]: prev.decks[prev.currentDeck].filter(
          (c) => c.id !== id,
        ),
      },
    }));
  };

  handleToggleLearned = (id, learned) => {
    this.setState((prev) => ({
      decks: {
        ...prev.decks,
        [prev.currentDeck]: prev.decks[prev.currentDeck].map((c) =>
          c.id === id ? { ...c, learned } : c,
        ),
      },
    }));
  };

  handleEditCard = (card) => {
    this.setState({
      front: card.front,
      back: card.back,
    });

    this.handleDeleteCard(card.id);
  };

  handleToggleOnlyUnlearned = (onlyUnlearned) => {
    this.setState({ onlyUnlearned });
  };

  handleStartStudy = () => {
    const deck = this.state.decks[this.state.currentDeck] || [];

    const filtered = this.state.onlyUnlearned
      ? deck.filter((c) => !c.learned)
      : deck;

    this.setState({
      studyDeck: filtered,
      currentIndex: 0,
      isFront: true,
    });
  };

  handleFlip = () => {
    this.setState((prev) => ({ isFront: !prev.isFront }));
  };

  handleNext = () => {
    this.setState((prev) => {
      if (prev.currentIndex < prev.studyDeck.length - 1) {
        return { currentIndex: prev.currentIndex + 1, isFront: true };
      }
    });
  };

  handlePrev = () => {
    this.setState((prev) => {
      if (prev.currentIndex > 0) {
        return { currentIndex: prev.currentIndex - 1, isFront: true };
      }
    });
  };

  handleShuffle = () => {
    this.setState((prev) => {
      const shuffled = [...prev.studyDeck];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return { studyDeck: shuffled, currentIndex: 0 };
    });
  };

  render() {
    const currentCards = this.state.decks[this.state.currentDeck] || [];

    return (
      <div className="App">
        <h1>Flashcards</h1>
        <DeckManager
          newDeckName={this.state.newDeckName}
          currentDeck={this.state.currentDeck}
          decks={this.state.decks}
          onDeckNameChange={this.handleDeckNameChange}
          onCreateDeck={this.handleCreateDeck}
          onSelectDeck={this.handleSelectDeck}
        />
        <CardForm
          front={this.state.front}
          back={this.state.back}
          hasCurrentDeck={!!this.state.currentDeck}
          onFrontChange={this.handleFrontChange}
          onBackChange={this.handleBackChange}
          onAddCard={this.handleAddCard}
        />
        <CardList
          cards={currentCards}
          onToggleLearned={this.handleToggleLearned}
          onDeleteCard={this.handleDeleteCard}
          onEditCard={this.handleEditCard}
        />
        <StudyMode
          onlyUnlearned={this.state.onlyUnlearned}
          studyDeck={this.state.studyDeck}
          currentIndex={this.state.currentIndex}
          isFront={this.state.isFront}
          onToggleOnlyUnlearned={this.handleToggleOnlyUnlearned}
          onStartStudy={this.handleStartStudy}
          onFlip={this.handleFlip}
          onNext={this.handleNext}
          onPrev={this.handlePrev}
          onShuffle={this.handleShuffle}
        />
      </div>
    );
  }
}
