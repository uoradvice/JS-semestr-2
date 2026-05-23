import React from "react";

const CardList = React.memo(
  ({ cards, onToggleLearned, onDeleteCard, onEditCard }) => {
    const handleToggleLearned = (id) => (e) => {
      onToggleLearned(id, e.target.checked);
    };

    const handleDeleteCard = (id) => () => {
      onDeleteCard(id);
    };

    const handleEditCard = (card) => () => {
      onEditCard(card);
    };

    return (
      <div>
        <h3>Cards</h3>
        {cards.map((c) => (
          <div key={c.id}>
            <b>{c.front}</b> --- {c.back}
            <input
              type="checkbox"
              checked={c.learned}
              onChange={handleToggleLearned(c.id)}
            />
            <button onClick={handleDeleteCard(c.id)}>Del</button>
            <button onClick={handleEditCard(c)}>Edit</button>
          </div>
        ))}
        <hr />
      </div>
    );
  },
);

export default CardList;
