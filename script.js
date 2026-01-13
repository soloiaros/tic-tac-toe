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
    getMark,
  }
}

const GameController = (() => {
  const gameboard = null;
  const players = [];
  let currentPlayer = 0;

  function startGame(boardResolution, playersInput) {
    if (+boardResolution === NaN || 2 > +boardResolution || +boardResolution > 16) {
      throw new Error('Inappropriate board size.')
    }
    if (players.length < 2 || playersInput.filter(x => x instanceof Player).length !== playersInput.length) {
      throw new Error('Inappropriate player amount or some of the passed players are not instances of the Player object.')
    }
    gameboard = Gameboard(Number(boardResolution));
    players.concat(playersInput);
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

  // function initiateGameLoop(players) {
  //   gameloop: while (true) {
  //     round: for (let player of players) {
  //       turn: while (true) {
  //         let [row, col] = prompt(`Now is ${player.mark}'s turn. Input row/column coords, space-separated.`).split(' ').map(x => Number(x));
  //         if (gameboard.checkCellEmpty(row, col)) {
  //           gameboard.placeMark(row, col, player.mark);
  //           console.table(gameboard.getBoard());
  //           break turn;
  //         } else {
  //           console.log('This coordinate has already been taken');
  //         }
  //       }
  //       let winningConditions = gameboard.checkWinningConditions();
  //       if (winningConditions) {
  //         console.log(`Player ${winningConditions.mark} has won!`);
  //         break gameloop;
  //       }
  //       if (gameboard.checkTie()) {
  //         console.log(`It's a tie! No one wins today.`);
  //         break gameloop;
  //       }
  //     }
  //   }
  // }
  return {
    startGame,
    getCurrentPlayer,
    takeTurn,
    checkGameEnd,
  }
})();

const ScreenController = (Gameboard) => {
  function drawBoard(boardResolution) {
    const board = document.querySelector('.board');
    board.style.gridTemplate = `repeat(1fr, ${boardResolution})`;

    for (let row = 0; row < boardResolution; row++) {
      for (let col = 0; col < boardResolution; col++) {
        let newCell = document.createElement('.div');
        newCell.classList.add('board-cell');
        newCell.addEventListener(
          'click', Gameboard.placeMark
        )
      }
    }
  }
}

// GameController.initializeBoard();
// GameController.initiateGameLoop([Player('x'), Player('o')]);