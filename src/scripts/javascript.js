const gameScore = (() => {
  const score = {
    P0: 0,
    P1: 0,
  };

  function _modifyScore(reset, newScore) {
    Object.keys(score).forEach((player, index) => {
      if (!reset) {
        score[player] += newScore[index];
      } else {
        score[player] = 0;
      }
    });
  }

  function _render() {
    for (let i = 0; i < Object.keys(score).length; i++) {
      document.querySelector(`#scoreP${i}`).textContent = score[`P${i}`];
    }
  }

  const setScore = (sign) => {
    const opts = {
      x: [false, [1, 0]],
      o: [false, [0, 1]],
      d: [false, [0, 0]],
      r: [true],
    };

    if (Object.keys(opts).includes(sign)) {
      _modifyScore(...opts[sign]);
      _render();
    }
  };

  // return setScore;
  return {
    get: score,
    set: setScore,
  };
})();

const gameboard = (() => {
  const board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];

  function _render(boardPos, opt) {
    const signs = {
      ['x']: 'sign--cross',
      ['o']: 'sign--circle',
      ['X']: 'sign--cross--win',
      ['O']: 'sign--circle--win',
    };
    const signElement = document.querySelector(`#gb${boardPos[0]}${boardPos[1]}`);

    if (opt === undefined) {
      Object.keys(signs).forEach((sign) => {
        signElement.classList.remove(signs[sign]);
      });
    } else {
      signElement.classList.add(signs[opt]);
    }
  }

  function _resetBoard() {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        board[i][j] = '';
        _render([i, j]);
      }
    }
  }

  function setGameboard(ai, sign, boardPos) {
    if (arguments.length === 0) {
      _resetBoard();
    } else if (ai) {
      playAi(board, sign);
    } else if (['x', 'o', 'X', 'O'].includes(sign)) {
      board[boardPos[0]][boardPos[1]] = sign;
      _render(boardPos, sign);
    }
  }

  function getWinner(sign, highlight) {
    let fullBoard = true;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === '') {
          fullBoard = false;
        }
      }
    }

    let winner = fullBoard ? 'd' : undefined;

    // prettier-ignore
    const coordinates = [
      [[0, 0], [0, 1], [0, 2],],
      [[1, 0], [1, 1], [1, 2],],
      [[2, 0], [2, 1], [2, 2],],

      [[0, 0], [1, 0], [2, 0],],
      [[0, 1], [1, 1], [2, 1],],
      [[0, 2], [1, 2], [2, 2],],

      [[0, 0], [1, 1], [2, 2],],
      [[0, 2], [1, 1], [2, 0],],
    ];

    coordinates.forEach((c) => {
      let sequence = '';

      for (let i = 0; i < 3; i++) {
        sequence += board[c[i][0]][c[i][1]].toLowerCase();
      }

      if (sequence === sign.repeat(3).toLowerCase()) {
        winner = sign;

        if (highlight) {
          for (let i = 0; i < 3; i++) {
            setGameboard(false, sign.toUpperCase(), [c[i][0], c[i][1]]);
          }
        }
      }
    });

    return winner;
  }

  return {
    get: board,
    set: setGameboard,
    getWinner: getWinner,
  };
})();

const CreatePlayer = (id, species, name, score, sign) => {
  return { id, species, name, score, sign };
};

const playAi = (board, sign) => {
  const signs = {
    human: sign === 'o' ? 'x' : 'o',
    ai: sign === 'o' ? 'o' : 'x',
  };

  const miniMax = (board, depth, isMaximizing) => {
    const _hasWinner = (sign) => gameboard.getWinner(sign, false);
    if (_hasWinner(signs.human) === signs.human) {
      return -1;
    } else if (_hasWinner(signs.ai) === signs.ai) {
      return 1;
    } else if (_hasWinner(signs.human) === 'd') {
      return 0;
    }

    const calculateNextMove = (isMaximizing) => {
      let bestScore = isMaximizing ? Infinity : -Infinity;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i][j] === '') {
            board[i][j] = isMaximizing ? 'x' : 'o';
            let score = miniMax(board, depth + 1, false);
            board[i][j] = '';
            bestScore = isMaximizing ? Math.min(score, bestScore) : Math.max(score, bestScore);
          }
        }
      }
      return bestScore;
    };

    return isMaximizing ? calculateNextMove(true) : calculateNextMove(false);
  };

  let bestScore = -Infinity;
  let optimalMove;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === '') {
        board[i][j] = signs.ai;
        let score = miniMax(board, 0, true);
        board[i][j] = '';
        if (score > bestScore) {
          bestScore = score;
          optimalMove = [i, j];
        }
      }
    }
  }
  gameboard.set(false, signs.ai, [optimalMove[0], optimalMove[1]]);
};

const game = (() => {
  const players = {
    0: CreatePlayer('P0', 'human', '', 0, 'x'),
    1: CreatePlayer('P1', '', '', 0, 'o'),
  };

  const resetButton = document.querySelector('.button__reset');
  resetButton.addEventListener('click', () => {
    location.reload();
  });

  const state = (() => {
    const states = {};
    const subscribe = (eventName, fn) => {
      states[eventName] = states[eventName] || [];
      states[eventName].push(fn);
    };
    const unsubscribe = (eventName, fn) => {
      if (states[eventName]) {
        for (var i = 0; i < states[eventName].length; i++) {
          if (states[eventName][i] === fn) {
            states[eventName].splice(i, 1);
            break;
          }
        }
      }
    };
    const publish = (eventName, data) => {
      if (states[eventName]) {
        states[eventName].forEach(function (fn) {
          fn(data);
        });
      }
    };

    return {
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      publish: publish,
    };
  })();

  const render = (() => {
    const panel = document.querySelector('.panel');
    const template = document.querySelector('#template').content;
    const pick = template.querySelector('.pick');
    const fill = template.querySelector('.fill');
    const score = template.querySelector('.score');

    const _pickPanel = () => {
      return pick;
    };

    const _fillPanel = (opponent) => {
      if (opponent === 'computer') {
        const inputP1 = fill.querySelector('.input:has([for="input__P1"])');
        inputP1.remove();
      }

      return fill;
    };

    const _scorePanel = () => {
      for (let i = 0; i < Object.keys(players).length; i++) {
        score.querySelector(`#nameP${i}`).textContent = players[i].name;
      }

      return score;
    };

    const renderPanel = (eventPanel, opt = undefined) => {
      const panels = {
        pick: _pickPanel,
        fill: _fillPanel,
        score: _scorePanel,
      };
      panel.replaceChildren(panels[eventPanel](opt));
    };

    return renderPanel;
  })();

  const getPlayers = (() => {
    const _getOpponent = (() => {
      render('pick');

      const buttonComputer = document.querySelector('.option__single');
      const buttonHuman = document.querySelector('.option__multi');

      const _buttonEvent = (button, species) => {
        button.addEventListener('click', () => {
          players[1].species = species;
          state.publish('fill');
        });
      };

      _buttonEvent(buttonComputer, 'computer');
      _buttonEvent(buttonHuman, 'human');
    })();

    const _getName = () => {
      render('fill', players[1].species);
      const form = document.querySelector('.fill__name-form');
      const button = document.querySelector('.button__name-form');

      button.addEventListener('click', (event) => {
        event.preventDefault();

        if (form.checkValidity()) {
          players[0].name = document.querySelector('#input__P0').value;
          players[1].name = players[1].species === 'human' ? document.querySelector('#input__P1').value : 'A.I.';

          state.publish('score');
        } else {
          form.reportValidity();
        }
      });
    };
    state.subscribe('fill', _getName);
  })();

  const play = () => {
    let round = 0;
    render('score');
    gameScore.set('r');

    const _resetMatch = () => {
      gameboard.set();
      round = 0;
    };

    const _startMatch = (() => {
      const cells = document.querySelectorAll(`[id^='gb']`);
      let resetOnNextClick = false;

      function _hasWinner(round, sign) {
        if (round < 4) {
          return false;
        }

        let winner = gameboard.getWinner(sign, true);

        if (round > 8 && winner === 'd') {
          return true;
        }

        return ['x', 'o'].includes(winner);
      }

      function _setScore(round, sign) {
        if (_hasWinner(round, sign)) {
          gameScore.set(gameboard.getWinner(sign, true));
          players[0].score = gameScore.get.P0;
          players[1].score = gameScore.get.P1;
          resetOnNextClick = true;
        }
      }

      cells.forEach((cell) => {
        cell.addEventListener('click', () => {
          if (resetOnNextClick) {
            resetOnNextClick = false;
            _resetMatch();
          } else if (gameboard.get[cell.id[2]][cell.id[3]] === '') {
            let sign = players[round % 2].sign;

            if (players[1].species === 'computer') {
              gameboard.set(false, players[0].sign, [cell.id[2], cell.id[3]]);
              round++;
              _setScore(round, sign);

              if (round < 9 && !_hasWinner(round, sign)) {
                gameboard.set(true, players[1].sign);
                round++;
                _setScore(round, players[1].sign);
              }
            } else {
              gameboard.set(false, sign, [cell.id[2], cell.id[3]]);
              round++;
              _setScore(round, sign);
            }
          }
        });
      });
    })();
  };
  state.subscribe('score', play);
})();
