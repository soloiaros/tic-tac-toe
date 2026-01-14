const Gameboard = ((boardResolution) => {
  boardState = [];
  for (let h = 0; h < boardResolution; h++) {
    boardState.push([]);
    for (let w = 0; w < boardResolution; w++) {
      boardState[h].push(null);
    }
  }

  function checkWinningConditions() {
    rotatedBoardState = boardState[0].map((col, i) => boardState.map(row => row[i]));
    for (let i = 0; i < boardResolution; i++) {
      if ((boardState[i].filter(x => x === boardState[i][0]).length === boardResolution) && boardState[i][0] !== null) {
        return {dimension: 'row', mark: boardState[i][0], place: i}
      } else if ((rotatedBoardState[i].filter(x => x === rotatedBoardState[i][0]).length === boardResolution) && rotatedBoardState[i][0] !== null) {
        return {dimension: 'col', mark: rotatedBoardState[i][0], place: i}
      }
    }
    for (let i = 1; i < boardResolution; i++) {
      if (boardState[i][i] === null || boardState[i][i] !== boardState[i - 1][i - 1]) {
        break
      } else if (i === boardResolution - 1) {
        return {direction: 'diagonal', mark: boardState[i][i], place: 'top-left-bottom-right'}
      }
    }
    for (let i = 1; i < boardResolution; i++) {
      if (boardState[i][boardResolution - i - 1] === null || boardState[i][boardResolution - i - 1] !== boardState[i - 1][boardResolution - i]) {
        break
      } else if (i === boardResolution - 1) {
        return {direction: 'diagonal', mark: boardState[i][boardResolution - i - 1], place: 'bottom-left-top-right'}
      }
    }
    return false
  }

  function checkTie() {
    if (boardState
      .reduce((accum, row) => accum = accum = accum.concat(row), [])
      .filter(x => x === null)
      .length === 0) {
        return true
      }
    return false
  }

  function checkCellEmpty(row, col) {
    return boardState[row][col] === null
  }

  function placeMark(row, col, mark) {
    boardState[row][col] = mark;
    return boardState
  }

  function getBoard() {
    return boardState
  }

  return {
    checkWinningConditions,
    checkCellEmpty,
    checkTie,
    placeMark,
    getBoard,
  }
})

const Player = (name, mark) => {
  function getMark() {
    return mark
  }
  
  function getName() {
    return name
  }
  return {
    getMark,
    getName,
  }
}

const GameController = (() => {
  let gameboard = null;
  let players = [];
  let currentPlayer = 0;

  function startGame(boardResolution, playersInput) {
    currentPlayer = 0;
    players = [];
    gameboard = null;
    if (+boardResolution === NaN || 2 > +boardResolution || +boardResolution > 16) {
      throw new Error('Inappropriate board size.')
    }
    if (playersInput.length < 2) {
      throw new Error('Inappropriate player amount.')
    }
    gameboard = Gameboard(Number(boardResolution));
    players = players.concat(playersInput);
    return true
  }

  const getCurrentPlayer = () => players[currentPlayer];

  function takeTurn(row, col) {
    if (!gameboard.checkCellEmpty(row, col)) {
      throw new Error('The cell is already taken');
    }
    gameboard.placeMark(row, col, players[currentPlayer].getMark());
    currentPlayer = (currentPlayer + 1) % players.length;
    return true
  }

  function checkGameState() {
    let winningConditions = gameboard.checkWinningConditions();
      if (winningConditions) {
        return { over: true, win: true, mark: winningConditions.mark }
      }
      if (gameboard.checkTie()) {
        return { over: true, win: false, mark: null}
      }
      return { over: false, win: false, mark: null }
  }

  return {
    startGame,
    getCurrentPlayer,
    takeTurn,
    checkGameState,
  }
})();

const ScreenController = (() => {
  const board = document.querySelector('.board');

  const addPlayerButton = document.querySelector('button.add-player');
  addPlayerButton.addEventListener(
    'click', () => {
      let newPlayerDiv = document.querySelector('.players .player-container').cloneNode(true);
      let previousPlayerDiv = Array.from(document.querySelectorAll('.players .player-container')).at(-1)
      let [newPlayerName, newPlayerMark] = [newPlayerDiv.querySelectorAll('label')[0], newPlayerDiv.querySelectorAll('label')[1]];
      let previousPlayerName = previousPlayerDiv.querySelector('label');

      let newPlayerIndex = !isNaN(+previousPlayerName.querySelector('.player-name').value.at(-1)) ? +previousPlayerName.querySelector('.player-name').value.at(-1) + 1 : 1;
      newPlayerName.querySelector('.player-name').value = 'Player ' + newPlayerIndex;
      newPlayerName.setAttribute('for', `player-name-${newPlayerIndex}`);
      newPlayerName.querySelector('.player-name').setAttribute('id', `player-name-${newPlayerIndex}`);
      newPlayerName.querySelector('.player-name').setAttribute('name', `player-name-${newPlayerIndex}`);
      newPlayerName.querySelector('.player-name').setAttribute('value', `Player ${newPlayerIndex}`);
      newPlayerMark.setAttribute('for', `player-mark-${newPlayerIndex}`);
      newPlayerMark.querySelector('.player-mark').setAttribute('id', `player-mark-${newPlayerIndex}`);
      newPlayerMark.querySelector('.player-mark').setAttribute('name', `player-mark-${newPlayerIndex}`);

      let removePlayerButton = document.createElement('button');
      removePlayerButton.textContent = "-";
      removePlayerButton.classList.add('remove-player');
      removePlayerButton.addEventListener(
        'click', () => newPlayerDiv.parentElement.removeChild(newPlayerDiv)
      )
      newPlayerDiv.appendChild(removePlayerButton);

      addPlayerButton.parentElement.insertBefore(newPlayerDiv, addPlayerButton);
    }
  )

  const startButton = document.querySelector('.start-button');
  startButton.addEventListener('click', () => {
    let boardResolutionInputValue = document.querySelector('#board-resolution').value;
    let playerDivs = document.getElementsByClassName('player-container');
    let players = [];
    for (let playerDiv of playerDivs) {
      let newPlayerName = playerDiv.querySelector('.player-name').value;
      let newPlayerMark = playerDiv.querySelector('.player-mark').value;
      let newPlayer = Player(newPlayerName, newPlayerMark);
      players.push(newPlayer);
    }

    try {
      GameController.startGame(boardResolutionInputValue, players);
      drawBoard(boardResolutionInputValue);
      activateBoard();
    } catch (error) {
      console.error(error);
    }
  })

  const gameInfo = document.querySelector('.game-info');
  gameInfo.textContent = 'Press the Start button!';

  function drawBoard(boardResolution = 3) {
    board.innerHTML = "";
    board.style['grid-template-rows'] = `repeat(${boardResolution}, 1fr)`;
    board.style['grid-template-columns']= `repeat(${boardResolution}, 1fr)`;

    for (let row = 0; row < boardResolution; row++) {
      for (let col = 0; col < boardResolution; col++) {
        let newCell = document.createElement('div');
        newCell.classList.add('board-cell');
        newCell.setAttribute('data-grid-row', row);
        newCell.setAttribute('data-grid-col', col);
        board.appendChild(newCell);
      }
    }
  }

  function deactivateBoard() {
    let cells = board.children;
    for (let cell of cells) {
      cell.toggleAttribute('disabled', true);
    }
  }

  function activateBoard() {
    let cells = board.children;
    gameInfo.textContent = `${GameController.getCurrentPlayer().getName()}'s Turn ("${GameController.getCurrentPlayer().getMark()}")`;
    gameInfo.setAttribute('data-state', 'ongoing');
    for (let cell of cells) {
      cell.toggleAttribute('disabled', false);
      cell.addEventListener(
          'click', () => {
            try {
              updateCell(cell, GameController.getCurrentPlayer().getMark());
              GameController.takeTurn(cell.getAttribute('data-grid-row'), cell.getAttribute('data-grid-col'));
              let gameState = GameController.checkGameState();
              if (gameState.over && gameState.win) {
                deactivateBoard();
                gameInfo.textContent = `${GameController.getCurrentPlayer().getName()} wins! Time for revenge 😈`;
                gameInfo.setAttribute('data-state', 'win');
              } else if (gameState.over && !gameState.win) {
                deactivateBoard();
                gameInfo.textContent = `Ok genlemen, nobody wins today. Let's try again`;
                gameInfo.setAttribute('data-state', 'tie');
              } else {
                gameInfo.textContent = `${GameController.getCurrentPlayer().getName()}'s Turn ("${GameController.getCurrentPlayer().getMark()}")`;
                gameInfo.setAttribute('data-state', 'ongoing');
              }
            } catch(error) {
              console.log(error)
            }
          }
        )
    }
  }

  function updateCell(cell, mark) {
    cell.innerText = mark;
  }

  return {
    drawBoard,
    activateBoard,
    deactivateBoard,
  }
})()


ScreenController.drawBoard();
ScreenController.deactivateBoard();