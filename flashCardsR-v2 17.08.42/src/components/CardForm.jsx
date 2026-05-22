import React from "react";

export default class CardForm extends React.Component {
  handleChangeFront = (e) => {
    this.props.onFrontChange(e.target.value);
  };

  handleChangeBack = (e) => {
    this.props.onBackChange(e.target.value);
  };

  handleAddCard = () => {
    this.props.onAddCard();
  };

  render() {
    const { front, back, hasCurrentDeck } = this.props;

    return (
      <div>
        <h3>Add Card</h3>
        <input
          type="text"
          placeholder="Front"
          value={front}
          onChange={this.handleChangeFront}
        />
        <input
          type="text"
          placeholder="Back"
          value={back}
          onChange={this.handleChangeBack}
        />
        <button onClick={this.handleAddCard} disabled={!hasCurrentDeck}>
          Add
        </button>
        <hr />
      </div>
    );
  }
}
