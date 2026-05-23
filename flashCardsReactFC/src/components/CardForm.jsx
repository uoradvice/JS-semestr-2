import React from "react";

const CardForm = React.memo(
  ({ front, back, hasCurrentDeck, onFrontChange, onBackChange, onAddCard }) => {
    const handleChangeFront = (e) => {
      onFrontChange(e.target.value);
    };

    const handleChangeBack = (e) => {
      onBackChange(e.target.value);
    };

    return (
      <div>
        <h3>Add Card</h3>
        <input
          type="text"
          placeholder="Front"
          value={front}
          onChange={handleChangeFront}
        />
        <input
          type="text"
          placeholder="Back"
          value={back}
          onChange={handleChangeBack}
        />
        <button onClick={onAddCard} disabled={!hasCurrentDeck}>
          Add
        </button>
        <hr />
      </div>
    );
  },
);

export default CardForm;
