const huPlayer = "O";
const aiPlayer = "X";
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
let origBoard;

const cells = document.querySelectorAll(".cell");

startGame();

function startGame() {
  document.querySelector(".endgame").style.display = "none";
  origBoard = Array.from(Array(9).keys());
  cells.forEach((el) => {
    el.innerText = "";
    el.style.removeProperty("background-color");
    el.addEventListener("click", turnClick, false);
  });
}

function turnClick(square) {
  if (typeof origBoard[square.target.id] === "number") {
    turn(square.target.id, huPlayer);
    if (!checkTie() && !checkWin(origBoard, huPlayer))
      turn(bestSpot(), aiPlayer);
  }
}

function turn(squareId, player) {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerText = player;
  let gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
  let plays = board.reduce((a, el, index) =>
    el === player ? a.concat(index) : a, []);

  for (let win of winCombos) {
    if (win.every(el => plays.indexOf(el) > -1)) {
      return { player: player };
    }
  }
  return null;
}

function gameOver(gameWon) {
  winCombos.forEach(win => {
    if (win.every(el => origBoard[el] === gameWon.player)) {
      win.forEach(index => {
        document.getElementById(index).style.backgroundColor = gameWon.player === huPlayer ? "blue" : "red";
      });
    }
  });

  cells.forEach(el => {
    el.removeEventListener("click", turnClick, false);
  });

  declareWinner(`${gameWon.player} ha vinto!`);
}

function declareWinner(who) {
  document.querySelector('.endgame').style.display = "block";
  document.querySelector('.endgame .text').innerHTML = who;
}

function emptySpots() {
  return origBoard.filter(el => typeof el === "number");
}

function bestSpot() {
  return minmax(origBoard, aiPlayer).index;
}

function checkTie() {
  if (emptySpots().length === 0) {
    cells.forEach(el => {
      el.style.backgroundColor = "green";
      el.removeEventListener("click", turnClick, false);
    });
    declareWinner("Pareggio!");
    return true;
  }
  return false;
}

function minmax(newBoard, player) {
  let availableSpots = emptySpots();

  if (checkWin(newBoard, huPlayer)) {
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 10 };
  } else if (availableSpots.length === 0) {
    return { score: 0 };
  }

  let moves = [];

  availableSpots.forEach((el, index) => {
    let move = {};
    move.index = newBoard[el];
    newBoard[el] = player;

    if (player === aiPlayer) {
      let result = minmax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      let result = minmax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[el] = move.index;

    moves.push(move);
  });

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -10000;
    moves.forEach(el => {
      if (el.score > bestScore) {
        bestScore = el.score;
        bestMove = el;
      }
    });
  } else {
    let bestScore = 10000;
    moves.forEach(el => {
      if (el.score < bestScore) {
        bestScore = el.score;
        bestMove = el;
      }
    });
  }
  return bestMove;
}
