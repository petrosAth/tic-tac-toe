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
      ['x']: [false, [1, 0]],
      ['o']: [false, [0, 1]],
      ['d']: [false, [0, 0]],
      ['_']: [true],
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
      let rng = [Math.floor(Math.random() * 3).toString(), Math.floor(Math.random() * 3).toString()];
      while (board[rng[0]][rng[1]] !== '') {
        rng = [Math.floor(Math.random() * 3).toString(), Math.floor(Math.random() * 3).toString()];
      }
      board[rng[0]][rng[1]] = sign;
      _render([[rng[0]], [rng[1]]], sign);
    } else if (['x', 'o', 'X', 'O'].includes(sign)) {
      board[boardPos[0]][boardPos[1]] = sign;
      _render(boardPos, sign);
    }
  }

  function getWinner(round, sign) {
    if (round < 4) {
      return;
    }

    let winner = 'n';

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

      if (sequence === sign.repeat(3)) {
        winner = sign;

        for (let i = 0; i < 3; i++) {
          setGameboard(false, sign.toUpperCase(), [c[i][0], c[i][1]]);
        }
      }
    });

    if (round > 8 && winner === 'n') {
      return 'd';
    }

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

const game = (() => {
  const players = {
    0: CreatePlayer('P0', 'human', '', 0, 'x'),
    1: CreatePlayer('P1', '', '', 0, 'o'),
  };

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
    const _getOpponent = () => {
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
    };
    events.subscribe('pick', _getOpponent);

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
    gameScore.set('_');

    const _resetMatch = () => {
      gameboard.set();
      round = 0;
    };

    const _startMatch = (() => {
      const cells = document.querySelectorAll(`[id^='gb']`);
      let resetOnNextClick = false;

      function testWin(round, sign) {
        if (['x', 'o', 'd'].includes(gameboard.getWinner(round, sign))) {
          gameScore.set(gameboard.getWinner(round, sign));
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
              if (round < 7) {
                gameboard.set(true, players[1].sign);
                round++;
                testWin(round, players[1].sign);
              }
            } else {
              gameboard.set(false, sign, [cell.id[2], cell.id[3]]);
            }
            round++;
            testWin(round, sign);
          }
        });
      });
    })();
  };
  state.subscribe('score', play);
})();
