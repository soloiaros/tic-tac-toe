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

const Player = (mark) => {
  function getMark() {
    return mark
  }
  return {
    mark,
    getMark,
  }
}

const GameController = ((players) => {
  const boardResolution = prompt('Input dimesions of the board.');
  const gameboard = Gameboard(Number(boardResolution));
  function initiateGameLoop() {
    gameloop: while (true) {
      round: for (let player of players) {
        turn: while (true) {
          let [row, col] = prompt(`Now is ${player.mark}'s turn. Input row/column coords, space-separated.`).split(' ').map(x => Number(x));
          if (gameboard.checkCellEmpty(row, col)) {
            gameboard.placeMark(row, col, player.mark);
            console.table(gameboard.getBoard());
            break turn;
          } else {
            console.log('This coordinate has already been taken');
          }
        }
        let winningConditions = gameboard.checkWinningConditions();
        if (winningConditions) {
          console.log(`Player ${winningConditions.mark} has won!`);
          break gameloop;
        }
        if (gameboard.checkTie()) {
          console.log(`It's a tie! No one wins today.`);
          break gameloop;
        }
      }
    }
  }
  return {
    initiateGameLoop,
  }
})([Player('x'), Player('o')]);

GameController.initiateGameLoop();