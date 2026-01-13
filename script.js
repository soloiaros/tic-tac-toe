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
    getName
  }
}

const GameController = (() => {
  let gameboard = null;
  let players = [];
  let currentPlayer = 0;

  function startGame(boardResolution, playersInput) {
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

  function checkGameEnd() {
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
    checkGameEnd,
  }
})();

const ScreenController = (() => {
  function drawBoard(boardResolution) {
    const board = document.querySelector('.board');
    board.style['grid-template-rows'] = `repeat(${boardResolution}, 1fr)`;
    board.style['grid-template-columns']= `repeat(${boardResolution}, 1fr)`;

    for (let row = 0; row < boardResolution; row++) {
      for (let col = 0; col < boardResolution; col++) {
        let newCell = document.createElement('div');
        newCell.classList.add('board-cell');
        newCell.addEventListener(
          'click', () => {
            GameController.takeTurn(row, col)
          }
        )
        board.appendChild(newCell);
      }
    }
  }

  return {
    drawBoard,
  }
})()


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
    ScreenController.drawBoard(boardResolutionInputValue);
  } catch (error) {
    console.error(error);
  }

})