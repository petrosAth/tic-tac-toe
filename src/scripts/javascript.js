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

  function setScore(opt) {
    if (opt === undefined) {
      return score;
    }

    const opts = {
      1: [true, [1, 0]],
      2: [true, [0, 1]],
      d: [true, [1, 1]],
      _: [false],
    };

    if (Object.keys(opts).includes(opt)) {
      modifyScore(...opts[opt]);
    }
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

const CreatePlayer = (id, species, name, score, sign) => {
  return { id, species, name, score, sign };
};

const game = (() => {
  const players = {
    0: CreatePlayer('P1', 'human', '', 0, 'x'),
    1: CreatePlayer('P2', '', '', 0, 'o'),
  };
  let round = 0;

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

        const inputP2 = fill.querySelector('.input:has([for="input__P2"])');
        inputP2.remove();
      }

      return fill;
    };

    const _scorePanel = () => {
      score.querySelector('#nameP1').textContent = players[0].name;
      score.querySelector('#nameP2').textContent = players[1].name;
      score.querySelector('#scoreP1').textContent = players[0].score;
      score.querySelector('#scoreP2').textContent = players[1].score;

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
          players[0].name = document.querySelector('#input__P1').value;
          players[1].name = players[1].species === 'human' ? document.querySelector('#input__P2').value : 'A.I.';

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
    render('score');
    const setScore = gameScore;
  };
  events.subscribe('score', play);
})();
