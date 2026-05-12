import React from "react";
import "./App.css";

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

  handleChangeDeckName = (e) => {
    this.setState({ newDeckName: e.target.value });
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

  handleSelectDeck = (e) => {
    this.setState({ currentDeck: e.target.value });
  };

  handleChangeFront = (e) => this.setState({ front: e.target.value });
  handleChangeBack = (e) => this.setState({ back: e.target.value });

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

  handleDeleteCard = (id) => () => {
    this.setState((prev) => ({
      decks: {
        ...prev.decks,
        [prev.currentDeck]: prev.decks[prev.currentDeck].filter(
          (c) => c.id !== id,
        ),
      },
    }));
  };

  handleToggleLearned = (id) => (e) => {
    const learned = e.target.checked;

    this.setState((prev) => ({
      decks: {
        ...prev.decks,
        [prev.currentDeck]: prev.decks[prev.currentDeck].map((c) =>
          c.id === id ? { ...c, learned } : c,
        ),
      },
    }));
  };

  handleEditCard = (card) => () => {
    this.setState({
      front: card.front,
      back: card.back,
    });

    this.handleDeleteCard(card.id)();
  };

  handleToggleOnlyUnlearned = (e) => {
    this.setState({ onlyUnlearned: e.target.checked });
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

    const studyCard =
      this.state.studyDeck.length > 0
        ? this.state.isFront
          ? this.state.studyDeck[this.state.currentIndex].front
          : this.state.studyDeck[this.state.currentIndex].back
        : "No cards";

    return (
      <div className="App">
        <h1>Flashcards</h1>
        <input
          type="text"
          placeholder="New deck"
          value={this.state.newDeckName}
          onChange={this.handleChangeDeckName}
        />
        <button onClick={this.handleCreateDeck}>Create deck</button>
        <select value={this.state.currentDeck} onChange={this.handleSelectDeck}>
          <option value="">Select deck</option>
          {Object.keys(this.state.decks).map((deck) => (
            <option key={deck} value={deck}>
              {deck}
            </option>
          ))}
        </select>
        <hr />
        <h3>Add Card</h3>
        <input
          type="text"
          placeholder="Front"
          value={this.state.front}
          onChange={this.handleChangeFront}
        />
        <input
          type="text"
          placeholder="Back"
          value={this.state.back}
          onChange={this.handleChangeBack}
        />
        <button onClick={this.handleAddCard}>Add</button>
        <hr />
        <h3>Cards</h3>
        {currentCards.map((c) => (
          <div key={c.id}>
            <b>{c.front}</b> --- {c.back}
            <input
              type="checkbox"
              checked={c.learned}
              onChange={this.handleToggleLearned(c.id)}
            />
            <button onClick={this.handleDeleteCard(c.id)}>Del</button>
            <button onClick={this.handleEditCard(c)}>Edit</button>
          </div>
        ))}
        <hr />
        <h2>Study Mode</h2>
        only unlearned
        <input
          type="checkbox"
          checked={this.state.onlyUnlearned}
          onChange={this.handleToggleOnlyUnlearned}
        />
        <button onClick={this.handleStartStudy}>Start</button>
        <button onClick={this.handleShuffle}>Shuffle</button>
        <div style={{ margin: "20px", fontSize: "20px" }}>{studyCard}</div>
        <button onClick={this.handlePrev}>Prev</button>
        <button onClick={this.handleFlip}>Flip</button>
        <button onClick={this.handleNext}>Next</button>
      </div>
    );
  }
}
