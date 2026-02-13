const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const statusBottom = document.getElementById('statusBottom');
const resetBtn = document.getElementById('resetBtn');
const startScreen = document.getElementById('startScreen');
const circle = document.getElementById('circle');
const circleLeft = document.getElementById('circleLeft');
const circleRight = document.getElementById('circleRight');
const gameContainer = document.getElementById('gameContainer');

let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'O'; // User plays O
let gameActive = true;
let moveCount = 0;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Handle start screen animation
circle.addEventListener('click', () => {
    circle.classList.add('splitting');
    circleLeft.classList.add('slide');
    circleRight.classList.add('slide');
    
    setTimeout(() => {
        startScreen.classList.add('hidden');
        gameContainer.classList.add('show');
    }, 800);
});

// Initialize game
function initGame() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetBtn.addEventListener('click', resetGame);
}

// Handle cell click
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameBoard[clickedCellIndex] !== '' || !gameActive || currentPlayer !== 'O') {
        return;
    }

    makeMove(clickedCellIndex, 'O');
    
    if (gameActive) {
        currentPlayer = 'X';
        statusText.textContent = "Computer's turn...";
        
        // Computer makes move after a short delay
        setTimeout(() => {
            if (gameActive) {
                computerMove();
            }
        }, 500);
    }
}

// Make a move
function makeMove(index, player) {
    gameBoard[index] = player;
    cells[index].classList.add('taken', player.toLowerCase());
    moveCount++;
    
    checkResult();
}

// Check game result
function checkResult() {
    let roundWon = false;
    let winningCombination = null;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] === '' || gameBoard[b] === '' || gameBoard[c] === '') {
            continue;
        }
        if (gameBoard[a] === gameBoard[b] && gameBoard[b] === gameBoard[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        const winner = gameBoard[winningCombination[0]];
        statusText.textContent = winner === 'O' ? 'you won' : 'Computer Wins!';
        statusBottom.textContent = winner === 'O' ? 'a prize' : '';
        statusText.classList.add('show');
        statusBottom.classList.add('show');
        resetBtn.classList.add('show');
        gameActive = false;
        return;
    }

    if (moveCount === 9) {
        statusText.textContent = "It's a Draw!";
        statusBottom.textContent = "It's a Draw!";
        statusText.classList.add('show');
        statusBottom.classList.add('show');
        resetBtn.classList.add('show');
        gameActive = false;
        return;
    }

    if (currentPlayer === 'O') {
        statusText.textContent = 'Your turn!';
    }
}

// Computer move - intentionally makes bad moves to let user win
function computerMove() {
    const availableMoves = gameBoard
        .map((cell, index) => cell === '' ? index : null)
        .filter(index => index !== null);

    if (availableMoves.length === 0 || !gameActive) {
        return;
    }

    let moveIndex;

    // Strategy: Make moves that help the user win
    
    // 1. Check if user can win next turn - don't block them!
    const userWinningMove = findWinningMove('O');
    
    // 2. Check if computer would win - avoid that move!
    const computerWinningMove = findWinningMove('X');
    
    // 3. If user can win, make a random move that doesn't block them
    if (userWinningMove !== null) {
        const nonBlockingMoves = availableMoves.filter(move => move !== userWinningMove);
        if (nonBlockingMoves.length > 0) {
            moveIndex = nonBlockingMoves[Math.floor(Math.random() * nonBlockingMoves.length)];
        } else {
            moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }
    // 4. If computer could win, avoid that move and make a random one
    else if (computerWinningMove !== null) {
        const nonWinningMoves = availableMoves.filter(move => move !== computerWinningMove);
        if (nonWinningMoves.length > 0) {
            moveIndex = nonWinningMoves[Math.floor(Math.random() * nonWinningMoves.length)];
        } else {
            moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }
    // 5. Make strategic "bad" moves
    else {
        // Prefer corners and edges over center to give user advantage
        const corners = [0, 2, 6, 8].filter(i => availableMoves.includes(i));
        const edges = [1, 3, 5, 7].filter(i => availableMoves.includes(i));
        
        if (moveCount === 1 && availableMoves.includes(4)) {
            // Avoid center on first move
            moveIndex = corners[Math.floor(Math.random() * corners.length)];
        } else if (corners.length > 0 && Math.random() > 0.3) {
            moveIndex = corners[Math.floor(Math.random() * corners.length)];
        } else if (edges.length > 0 && Math.random() > 0.5) {
            moveIndex = edges[Math.floor(Math.random() * edges.length)];
        } else {
            moveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }

    makeMove(moveIndex, 'X');
    currentPlayer = 'O';
}

// Find winning move for a player
function findWinningMove(player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        const line = [gameBoard[a], gameBoard[b], gameBoard[c]];
        
        if (line.filter(cell => cell === player).length === 2 && line.includes('')) {
            if (gameBoard[a] === '') return a;
            if (gameBoard[b] === '') return b;
            if (gameBoard[c] === '') return c;
        }
    }
    return null;
}

// Reset game
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'O';
    moveCount = 0;
    statusText.textContent = '';
    statusBottom.textContent = '';
    statusText.classList.remove('show');
    statusBottom.classList.remove('show');
    resetBtn.classList.remove('show');
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o');
    });
}

// Start the game
initGame();
