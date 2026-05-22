import React from "react";

export default class DeckManager extends React.Component {
  handleChangeDeckName = (e) => {
    this.props.onDeckNameChange(e.target.value);
  };

  handleCreateDeck = () => {
    this.props.onCreateDeck();
  };

  handleSelectDeck = (e) => {
    this.props.onSelectDeck(e.target.value);
  };

  render() {
    const { newDeckName, currentDeck, decks } = this.props;

    return (
      <div>
        <input
          type="text"
          placeholder="New deck"
          value={newDeckName}
          onChange={this.handleChangeDeckName}
        />
        <button onClick={this.handleCreateDeck}>Create deck</button>
        <select value={currentDeck} onChange={this.handleSelectDeck}>
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
  }
}
