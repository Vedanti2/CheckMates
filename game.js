let boardSize = 4;
let board = [];
let solving = false, paused = false;
let timer = 0, timerInterval;
let highscore = localStorage.getItem("nqueen_highscore");

if (highscore === null) {
    highscore = "--";
} else {
    highscore = parseInt(highscore);
}

document.getElementById("highscore").textContent = "Best Time: " + highscore;

function startGame() {
    boardSize = parseInt(document.getElementById("boardSize").value);
    if (isNaN(boardSize) || boardSize < 4) {
        alert("Please enter a board size of 4 or greater.");
        return;
    }
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
    let cellSize = Math.min(50, Math.floor(600 / boardSize));
    boardContainer.style.gridTemplateColumns = `repeat(${boardSize + 1}, ${cellSize}px)`;
    boardContainer.style.setProperty('--cell-size', `${cellSize}px`);

    boardContainer.innerHTML = "";

    for (let col = -1; col < boardSize; col++) {
        const colNumCell = document.createElement("div");
        colNumCell.className = "cell number-cell";
        if (col === -1) {
            colNumCell.textContent = "";
        } else {
            colNumCell.textContent = col;
        }
        boardContainer.appendChild(colNumCell);
    }

    for (let row = 0; row < boardSize; row++) {
        const rowNumCell = document.createElement("div");
        rowNumCell.className = "cell number-cell";
        rowNumCell.textContent = row;
        boardContainer.appendChild(rowNumCell);

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
        if (isNaN(row) || isNaN(col)) return;

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
    if (solving) return; // Prevent multiple simultaneous solves
    solving = true;
    paused = false;
    board.fill(-1);
    timer = 0;
    document.getElementById("timer").textContent = "Time: 0s";
    document.getElementById("pauseBtn").textContent = "Pause";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById("timer").textContent = `Time: ${timer}s`;
    }, 1000);
    stepSolve(0);
}

function stepSolve(row) {
    if (paused) return;
    if (row < 0) {
        explain("❌ No solution found.");
        solving = false;
        clearInterval(timerInterval);
        return;
    }
    if (row >= boardSize) {
        gameWin();
        return;
    }

    let col = board[row] + 1;
    const tryNext = () => {
        if (paused) return;

        if (col >= boardSize) {
            board[row] = -1;
            drawBoard();
            explain(`🔁 Backtracking from row ${row}`);
            setTimeout(() => stepSolve(row - 1), 800);
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
    if (!solving) return;
    paused = !paused;
    document.getElementById("pauseBtn").textContent = paused ? "Resume" : "Pause";
    if (!paused) {
        const nextRow = board.findIndex(pos => pos === -1);
        stepSolve(nextRow === -1 ? boardSize : nextRow);
    }
}

function gameWin() {
    solving = false;
    paused = false;
    clearInterval(timerInterval);
    drawBoard();
    explain(`🎉 All queens placed successfully in ${timer}s!`);

    if (highscore === "--" || timer < highscore) {
        highscore = timer;
        localStorage.setItem("nqueen_highscore", timer);
        document.getElementById("highscore").textContent = "Best Time: " + timer;
    }
}

// --------------------- "Get Help" Functionality ---------------------

// Check if a position is safe for the help function
const isSafeHelp = (boardConfig, row, col) => {
    for (let i = 0; i < col; i++) {
        if (boardConfig[row][i]) return false;
    }
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
        if (boardConfig[i][j]) return false;
    }
    for (let i = row, j = col; j >= 0 && i < boardSize; i++, j--) {
        if (boardConfig[i][j]) return false;
    }
    return true;
};

// Recursive function to solve the N-Queen problem
const solveNQueensHelp = (boardConfig, col) => {
    if (col >= boardSize) return true;

    for (let i = 0; i < boardSize; i++) {
        if (isSafeHelp(boardConfig, i, col)) {
            boardConfig[i][col] = 1;

            if (solveNQueensHelp(boardConfig, col + 1)) return true;

            boardConfig[i][col] = 0; // Backtrack
        }
    }

    return false;
};



// --------------------- "Get Hint" Functionality ---------------------

function getHint() {
    // Find the next row where a queen needs to be placed
    const nextRow = board.findIndex(row => row === -1);

    if (nextRow === -1) {
        explain("🎉 All rows have queens! No hint available.");
        return;
    }

    // Try to find a safe column in the next row
    for (let col = 0; col < boardSize; col++) {
        if (isSafe(nextRow, col)) {
            explain(`💡 Hint: Place a queen at row ${nextRow}, column ${col}.`);
            highlightCell(nextRow, col, "safe"); // Highlight the suggested cell
            return;
        }
    }

    explain("😔 No safe position found for the next queen.");
}

