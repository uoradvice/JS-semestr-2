import React from "react";

const StudyMode = React.memo(
  ({
    onlyUnlearned,
    studyDeck,
    currentIndex,
    isFront,
    onToggleOnlyUnlearned,
    onStartStudy,
    onFlip,
    onNext,
    onPrev,
    onShuffle,
  }) => {
    const handleToggleOnlyUnlearned = (e) => {
      onToggleOnlyUnlearned(e.target.checked);
    };

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
          onChange={handleToggleOnlyUnlearned}
        />
        <button onClick={onStartStudy}>Start</button>
        <button onClick={onShuffle}>Shuffle</button>
        <div style={{ margin: "20px", fontSize: "20px" }}>{studyCard}</div>
        <button onClick={onPrev}>Prev</button>
        <button onClick={onFlip}>Flip</button>
        <button onClick={onNext}>Next</button>
      </div>
    );
  },
);

export default StudyMode;
