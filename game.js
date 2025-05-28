let boardSize = 4;
let board = [];
let solving = false, paused = false;
let timer = 0, timerInterval;
let highscore = localStorage.getItem("nqueen_highscore") || "--";

document.getElementById("highscore").textContent = "Best Time: " + highscore;

function startGame() {
  boardSize = parseInt(document.getElementById("boardSize").value);
  board = Array(boardSize).fill(-1);
  solving = false;
  paused = false;
  document.getElementById("pauseBtn").textContent = "Pause";
  clearInterval(timerInterval);
  timer = 0;
  document.getElementById("timer").textContent = "Time: 0s";
  generateBoard();
}

function generateBoard() {
  const boardContainer = document.getElementById("board");
  boardContainer.style.gridTemplateColumns = `repeat(${boardSize}, 70px)`;
  boardContainer.innerHTML = "";

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.onclick = () => placeQueen(row, col);
      boardContainer.appendChild(cell);
    }
  }

  document.getElementById("explanation").innerHTML = `<b>Game Started!</b> Place queens manually or use auto-solve.`;
  drawBoard();
}

function isSafe(row, col) {
  for (let r = 0; r < row; r++) {
    const c = board[r];
    if (c === col || Math.abs(c - col) === Math.abs(r - row)) {
      return false;
    }
  }
  return true;
}

function placeQueen(row, col) {
  if (solving) return;
  if (!isSafe(row, col)) {
    explain(`❌ Cannot place at (${row}, ${col}): Another queen is attacking diagonally or vertically.`);
    highlightCell(row, col, "conflict");
    return;
  }

  board[row] = col;
  drawBoard();
  explain(`✅ Placed queen at (${row}, ${col}) safely.`);

  if (row === boardSize - 1 && board.every(pos => pos !== -1)) {
    gameWin();
  }
}

function drawBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const isQueen = board[row] === col;

    cell.textContent = isQueen ? "♛" : "";
    cell.classList.remove("conflict", "safe");
    cell.style.backgroundImage = isQueen ? "none" : "url('empty.gif')";
    cell.style.backgroundSize = isQueen ? "none" : "30px 30px";
    cell.style.backgroundRepeat = "no-repeat";
    cell.style.backgroundPosition = "center";

    if (isQueen && isSafe(row, col)) {
      cell.classList.add("safe");
    }
  });
}

function explain(msg) {
  document.getElementById("explanation").innerHTML = msg;
}

function highlightCell(row, col, className) {
  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  if (cell) cell.classList.add(className);
}

function solveAutomatically() {
  solving = true;
  timerInterval = setInterval(() => {
    timer++;
    document.getElementById("timer").textContent = `Time: ${timer}s`;
  }, 1000);
  board.fill(-1);
  stepSolve(0);
}

function stepSolve(row) {
  if (paused) return;
  if (row >= boardSize) {
    gameWin();
    return;
  }

  let col = 0;
  const tryNext = () => {
    if (paused) return;
    if (col >= boardSize) {
      explain(`🔁 Backtracking from row ${row}`);
      stepSolve(row - 1);
      return;
    }

    if (isSafe(row, col)) {
      board[row] = col;
      drawBoard();
      explain(`✅ Placing queen at (${row}, ${col}) is safe. Moving to next row...`);
      setTimeout(() => stepSolve(row + 1), 800);
    } else {
      explain(`❌ Conflict at (${row}, ${col}) — cannot place due to existing queen conflict.`);
      col++;
      setTimeout(tryNext, 500);
    }
  };

  tryNext();
}

function pauseResume() {
  paused = !paused;
  document.getElementById("pauseBtn").textContent = paused ? "Resume" : "Pause";
  if (!paused && solving) stepSolve(board.findIndex(pos => pos === -1));
}

function gameWin() {
  solving = false;
  clearInterval(timerInterval);
  drawBoard();
  explain(`🎉 All queens placed successfully in ${timer}s!`);

  if (highscore === "--" || timer < highscore) {
    localStorage.setItem("nqueen_highscore", timer);
    document.getElementById("highscore").textContent = "Best Time: " + timer;
  }
}
