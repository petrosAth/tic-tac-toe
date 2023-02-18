const gameScore = (() => {
  const score = {
    P1: 0,
    P2: 0,
  };

  function modifyScore(notReset, newScore) {
    Object.keys(score).forEach((player, index) => {
      if (notReset) {
        score[player] += newScore[index];
      } else {
        score[player] = 0;
      }
    });
  }

  function modifyHTML() {
    const scoreP1element = document.querySelector('#scoreP1');
    const scoreP2element = document.querySelector('#scoreP2');

    scoreP1element.textContent = score.P1;
    scoreP2element.textContent = score.P2;
  }

  function setScore(opt) {
    const opts = {
      P1: [true, [1, 0]],
      P2: [true, [0, 1]],
      draw: [true, [1, 1]],
      reset: [false],
    };

    if (Object.keys(opts).includes(opt)) {
      modifyScore(...opts[opt]);
    }

    modifyHTML();
  }

  return setScore;
})();
