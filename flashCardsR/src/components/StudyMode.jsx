import React from "react";

export default class StudyMode extends React.Component {
  handleToggleOnlyUnlearned = (e) => {
    this.props.onToggleOnlyUnlearned(e.target.checked);
  };

  handleStartStudy = () => {
    this.props.onStartStudy();
  };

  handleFlip = () => {
    this.props.onFlip();
  };

  handleNext = () => {
    this.props.onNext();
  };

  handlePrev = () => {
    this.props.onPrev();
  };

  handleShuffle = () => {
    this.props.onShuffle();
  };

  render() {
    const { onlyUnlearned, studyDeck, currentIndex, isFront } = this.props;

    const studyCard =
      studyDeck.length > 0
        ? isFront
          ? studyDeck[currentIndex].front
          : studyDeck[currentIndex].back
        : "No cards";

    return (
      <div>
        <h2>Study Mode</h2>
        only unlearned
        <input
          type="checkbox"
          checked={onlyUnlearned}
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
