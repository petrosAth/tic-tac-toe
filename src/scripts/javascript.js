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

  const setScore = (opt) => {
    const opts = {
      ['x']: [false, [1, 0]],
      ['o']: [false, [0, 1]],
      ['d']: [false, [0, 0]],
      ['_']: [true],
    };

    if (Object.keys(opts).includes(opt)) {
      _modifyScore(...opts[opt]);
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

  function _resetBoard() {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        board[i][j] = '';
        _render([i, j]);
      }
    }
  }

  function setGameboard(boardPos, opt) {
    if (boardPos === undefined) {
      _resetBoard();
    } else if (['x', 'o'].includes(opt)) {
      board[boardPos[0]][boardPos[1]] = opt;
      _render(boardPos, opt);
    }
  }

  function getWinner(round, sign) {
    if (round < 4) {
      return;
    }

    let winner = 'n';

      [board[0][0], board[1][0], board[2][0]],
      [board[0][1], board[1][1], board[2][1]],
      [board[0][2], board[1][2], board[2][2]],

      [board[0][0], board[1][1], board[2][2]],
      [board[0][2], board[1][1], board[2][0]],
    ];

    combinations.forEach((combination) => {
      console.log(combination.join('') === sign.repeat(3));
      if (combination.join('') === sign.repeat(3)) {
        winner = sign;
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

  const events = (() => {
    const events = {};
    const subscribe = (eventName, fn) => {
      events[eventName] = events[eventName] || [];
      events[eventName].push(fn);
    };
    const unsubscribe = (eventName, fn) => {
      if (events[eventName]) {
        for (var i = 0; i < events[eventName].length; i++) {
          if (events[eventName][i] === fn) {
            events[eventName].splice(i, 1);
            break;
          }
        }
      }
    };
    const publish = (eventName, data) => {
      if (events[eventName]) {
        events[eventName].forEach(function (fn) {
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
        console.log(opponent); // WARN: Delete before deployment

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
          events.publish('fill');

          console.log(players[0]); // WARN: Delete before deployment
          console.log(players[1]); // WARN: Delete before deployment
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

          console.log(players[0]); // WARN: Delete before deployment
          console.log(players[1]); // WARN: Delete before deployment

          events.publish('score');
        } else {
          form.reportValidity();
        }
      });
    };
    events.subscribe('fill', _getName);
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
      const buttons = document.querySelectorAll(`[id^='gb']`);
      let resetOnNextClick = false;

      buttons.forEach((cell) => {
        cell.addEventListener('click', () => {
          if (resetOnNextClick) {
            resetOnNextClick = false;
            _resetMatch();
          } else if (gameboard.get[cell.id[2]][cell.id[3]] === '') {
            let sign = players[round % 2].sign;

            gameboard.set([cell.id[2], cell.id[3]], sign);
            round++;

            if (['x', 'o', 'd'].includes(gameboard.getWinner(round, sign))) {
              console.log(round + ' ' + sign);
              console.log('has winner: ' + gameboard.getWinner(round, sign)); // WARN: Delete before deployment
              gameScore.set(gameboard.getWinner(round, sign));
              players[0].score = gameScore.get.P0;
              players[1].score = gameScore.get.P1;
              resetOnNextClick = true;
            }
          }
        });
      });
    })();
  };
  events.subscribe('score', play);

  events.publish('pick');
})();
