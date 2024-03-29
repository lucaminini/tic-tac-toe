var huPlayer = "O";
var aiPlayer = "X";
var currPlayer = "O"; // For two-player mode
var winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
var origBoard;
var gamemode = "";

var cells = document.querySelectorAll(".cell");

// Function to open the mode selection modal
function selectMode() {
  var modal = document.getElementById("modeModal");
  modal.style.display = "block";
}

window.onload = selectMode;

// Function to set the game mode based on user selection
function setMode(mode) {
  var modal = document.getElementById("modeModal");
  modal.style.display = "none";
  gamemode = mode;
  startGame();
}

function startGame() {
  document.querySelector(".endgame").style.display = "none";
  origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (var i = 0; i < cells.length; i++) {
    cells[i].innerText = "";
    cells[i].classList.remove("winning"); // Remove winning class
    cells[i].addEventListener("click", turnClick, false);
  }
}

function turnClick(square) {
  if (typeof origBoard[square.target.id] === "number") {
    turn(square.target.id, currPlayer);
    if (!checkWin(origBoard, currPlayer)) {
      if (gamemode === "two") {
        if (checkTie()) {
          declareWinner("Pareggio!");
        } else {
          currPlayer = currPlayer === "O" ? "X" : "O";
        }
      } else if (gamemode === "single" && !checkTie()) {
        setTimeout(function () {
          turn(bestSpot(), aiPlayer);
        }, 200);
      }
    }
  }
}

function turn(squareId, player) {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerText = player;
  var gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
  var plays = board.reduce(function (a, el, index) {
    return el === player ? a.concat(index) : a;
  }, []);

  for (var i = 0; i < winCombos.length; i++) {
    var win = winCombos[i];
    var isWinning = true;
    for (var j = 0; j < win.length; j++) {
      if (plays.indexOf(win[j]) === -1) {
        isWinning = false;
        break;
      }
    }
    if (isWinning) {
      return { player: player };
    }
  }
  return null;
}

function gameOver(gameWon) {
  for (var i = 0; i < winCombos.length; i++) {
    var win = winCombos[i];
    var isWinning = true;
    for (var j = 0; j < win.length; j++) {
      if (origBoard[win[j]] !== gameWon.player) {
        isWinning = false;
        break;
      }
    }
    if (isWinning) {
      for (var k = 0; k < win.length; k++) {
        document.getElementById(win[k]).classList.add("winning"); // Add winning class
      }
    }
  }

  for (var i = 0; i < cells.length; i++) {
    cells[i].removeEventListener("click", turnClick, false);
  }

  if (gameWon.player === "X" && gamemode == "single") {
    declareWinner("Pepper ha vinto!");
    pepperWon();
  } else {
    declareWinner(gameWon.player + " ha vinto!");
  }
}

function declareWinner(who) {
  document.querySelector(".endgame").style.display = "block";
  document.querySelector(".endgame .text").innerHTML = who;
}

function emptySpots() {
  return origBoard.filter(function (el) {
    return typeof el === "number";
  });
}

function bestSpot() {
  return minmax(origBoard, aiPlayer).index;
}

function checkTie() {
  if (emptySpots().length === 0) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].removeEventListener("click", turnClick, false);
    }
    declareWinner("Pareggio!");
    return true;
  }
  return false;
}

function minmax(newBoard, player) {
  var availableSpots = emptySpots();

  if (checkWin(newBoard, huPlayer)) {
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 10 };
  } else if (availableSpots.length === 0) {
    return { score: 0 };
  }

  var moves = [];

  for (var i = 0; i < availableSpots.length; i++) {
    var el = availableSpots[i];
    var move = {};
    move.index = newBoard[el];
    newBoard[el] = player;

    if (player === aiPlayer) {
      var result = minmax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      var result = minmax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[el] = move.index;

    moves.push(move);
  }

  var bestMove;
  if (player === aiPlayer) {
    var bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    var bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }
  return bestMove;
}

var session = null;

session = null;
QiSession(connected, disconnected, location.host);

function connected(s) {
  console.log("Session connected");
  session = s;
  //If you want to subscribe so some events (to send info pepper->tablet) call the function here
}

function disconnected(error) {
  console.log("Session disconnected");
}

function pepperWon() {
  session.service("ALMemory").then(function (memory) {
    memory.raiseEvent("pepperWon", "1");
  });
}
