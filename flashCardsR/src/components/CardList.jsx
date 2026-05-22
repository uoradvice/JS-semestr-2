import React from "react";

export default class CardList extends React.Component {
  handleToggleLearned = (id) => (e) => {
    this.props.onToggleLearned(id, e.target.checked);
  };

  handleDeleteCard = (id) => () => {
    this.props.onDeleteCard(id);
  };

  handleEditCard = (card) => () => {
    this.props.onEditCard(card);
  };

  render() {
    const { cards } = this.props;

    return (
      <div>
        <h3>Cards</h3>
        {cards.map((c) => (
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
      </div>
    );
  }
}
