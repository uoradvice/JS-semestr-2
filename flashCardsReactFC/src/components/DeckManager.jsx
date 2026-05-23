import React from "react";

const DeckManager = React.memo(
  ({
    newDeckName,
    currentDeck,
    decks,
    onDeckNameChange,
    onCreateDeck,
    onSelectDeck,
  }) => {
    const handleChangeDeckName = (e) => {
      onDeckNameChange(e.target.value);
    };

    const handleSelectDeck = (e) => {
      onSelectDeck(e.target.value);
    };

    return (
      <div>
        <input
          type="text"
          placeholder="New deck"
          value={newDeckName}
          onChange={handleChangeDeckName}
        />
        <button onClick={onCreateDeck}>Create deck</button>
        <select value={currentDeck} onChange={handleSelectDeck}>
          <option value="">Select deck</option>
          {Object.keys(decks).map((deck) => (
            <option key={deck} value={deck}>
              {deck}
            </option>
          ))}
        </select>
        <hr />
      </div>
    );
  },
);

export default DeckManager;
