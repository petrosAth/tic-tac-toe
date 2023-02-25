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
      1: [true, [1, 0]],
      2: [true, [0, 1]],
      d: [true, [1, 1]],
      _: [false],
    };

    if (Object.keys(opts).includes(opt)) {
      modifyScore(...opts[opt]);
    }

    modifyHTML();
  }

  return setScore;
})();

const gameboard = (() => {
  const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];

  function modifyHTML(boardPos, opt) {
    const signs = {
      x: { name: 'cross', cssClass: 'sign--cross' },
      o: { name: 'circle', cssClass: 'sign--circle' },
    };
    const signElement = document.querySelector(`#gb${boardPos[0]}${boardPos[1]}`);

    if (opt === undefined) {
      Object.keys(signs).forEach((sign) => {
        signElement.classList.remove(signs[sign].cssClass);
      });
    } else {
      signElement.classList.add(signs[opt].cssClass);
    }
  }

  function resetBoard() {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        board[i][j] = '';
        modifyHTML([i, j]);
      }
    }
  }

  function setGameboard(boardPos, opt) {
    if (boardPos === undefined) {
      resetBoard();
    } else if (['x', 'o'].includes(opt)) {
      board[boardPos[0]][boardPos[1]] = opt;
      modifyHTML(boardPos, opt);
    }
  }

  (function watchBoard() {
    const buttons = document.querySelectorAll(`[id^='gb']`);
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (board[btn.id[2]][btn.id[3]] === '') {
          setGameboard([btn.id[2], btn.id[3]], 'x');
        }
      });
    });
  })();

  return board;
})();
const game = (() => {
  function togglePanels(panels) {
    panels.forEach((panel) => {
      const togglePanel = document.querySelector(`.${panel}`);
      togglePanel.classList.toggle(`${panel}--hidden`);
    });
  }
const CreatePlayer = (id, species, name, score, sign) => {
  (function modifyHTML() {
    const player = document.querySelector(`#name${id}`);
    player.textContent = `${name} ${sign}`;
  })();

  function setMode(mode) {
    if (!['opponent', 'name', 'score'].includes(mode)) {
      return;
    }
  return { id, species, name, score, sign };
};

    const modes = {
      opponent: {},
      name: {
        computer: ['opponent', 'name', 'input__P1'],
        human: ['opponent', 'name', 'input__P1', 'input__P2'],
      },
      score: {},
    };

    togglePanels(modes[mode][getOpponent()]);

    return mode;
  }

  const getOpponent = (() => {
    let opponent;

    function setOpponent(opt) {
      opponent = opt;
      setMode('name');
    }

    const btnComputer = document.querySelector('.option__single');
    const btnHuman = document.querySelector('.option__multi');

    btnComputer.addEventListener('click', () => {
      setOpponent('computer');
    });

    btnHuman.addEventListener('click', () => {
      setOpponent('human');
    });

    function returnOpponent() {
      return opponent;
    }

    return returnOpponent;
  })();
})();
