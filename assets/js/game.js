import gameplay from "./gameplay.js";

const boardElement = document.querySelector("#board");
const startElement = document.querySelector("#start");
const messageElement = document.querySelector("#message");
const cellElements = [...document.querySelectorAll(".cell")];

const winningPositions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function startGame(event) {
    event.stopPropagation()
    cellElements.forEach(cellElement => cellElement.classList.add("cell-hover"))
    startElement.textContent = "";
    messageElement.textContent = "Pick a spot, human";
    boardElement.addEventListener("click", playHandler)
    startElement.removeEventListener("click", startGame)
}

function endGame({ hasWinner, hasFinishedGame, winner, positions }) {
    if (hasWinner) {
        showResults(hasWinner, winner, positions)
    } else if (hasFinishedGame) {
        showResults(hasWinner)
    }

    boardElement.removeEventListener("click", playHandler)
    cellElements.forEach(cellElement => cellElement.classList.remove("cell-hover"))
}

function playHandler(event) {
    const clickedCell = event.target.closest(".cell");
    const isComputerPlaying = (!gameplay.currentPlayer) ? true : false;
    const playedCells = [];

    for (const cellObj of gameplay.board) {
        if (cellObj.played) {
            playedCells.push(cellElements[cellObj.position]) // check ***
        }
    }

    const isPlayableCell = !(playedCells.includes(clickedCell));

    if (isPlayableCell) {
        if (isComputerPlaying) {
            playComputersCell(clickedCell)
        } else {
            playCell(clickedCell)
        }
    }
} 

function playComputersCell(clickedCell) {
    gameplay.board.forEach(cellObj =>
        cellElements[cellObj.position].classList.remove("cell-hover")
    );

    boardElement.removeEventListener("click", playHandler)

    setTimeout(() => {
        boardElement.addEventListener("click", playHandler)
        playCell(clickedCell)

        const { hasWinner } = getGameStatus();

        if (!hasWinner) {
            gameplay.board.forEach(cellObj => {
                if (!cellObj.played) {
                    cellElements[cellObj.position].classList.add("cell-hover")
                }
            })
        }
    }, 1000)
}

function playCell(clickedCell) { 
    const cellIndex = [...clickedCell.parentElement.children].indexOf(clickedCell)
    const clickedCellElement = cellElements[cellIndex];
    const clickedCellObj = gameplay.board[cellIndex];

    if (!clickedCellObj.played) {
        updateCell(clickedCellElement, clickedCellObj)
    }

    const gameStatus = getGameStatus();
    const { hasWinner, hasFinishedGame } = gameStatus;

    (hasWinner || hasFinishedGame) ? endGame(gameStatus) : setNextPlayer();
}

function resetGame() {
    gameplay.currentPlayer = 1;
    startElement.classList.add("cell-hover")

    cellElements.forEach(cellElement => {
        cellElement.textContent = "";
        cellElement.removeAttribute("style")
    })

    gameplay.board.forEach((cellObj, index) => {        
        cellObj.mark = null;
        cellObj.position = index;
        cellObj.played = false;
        cellObj.player = null;
    })

    messageElement.textContent = "Play again?";
    startElement.textContent = "start";
    startElement.addEventListener("click", startGame)
}

function setNextPlayer() {
    gameplay.currentPlayer = !gameplay.currentPlayer;
    const isComputersTurn = gameplay.currentPlayer == 0;
    updateGameMessage()

    if (isComputersTurn) {
        getComputerChoice()
    }
}

function getComputerChoice() {
    const playableCells = [];

    for (const cellObj of gameplay.board) {
        if (!cellObj.played) {
            playableCells.push(cellElements[cellObj.position])
        }
    }

    const computerChoice = playableCells[Math.floor(Math.random() * playableCells.length)];
    computerChoice.click()
}

function updateGameMessage() {
    messageElement.textContent = (gameplay.currentPlayer) ? "Human's Turn" : "Computer's Turn";
}

function updateCell(clickedCellElement, clickedCellObj) {
    const div = document.createElement("div");
    const mark = (gameplay.currentPlayer) ? "X" : "O";
    div.textContent = mark;
    clickedCellElement.append(div)
    clickedCellElement.classList.remove("cell-hover")
    clickedCellObj.played = true;
    clickedCellObj.player = (gameplay.currentPlayer) ? "human": "computer";
    clickedCellObj.mark = mark;
}

function getGameStatus() {
    
    const playedCells = gameplay.board.filter(cellObj => cellObj.played);
    const player = (gameplay.currentPlayer) ? "human" : "computer";
    const currentPlayerPositions = playedCells.map(cellObj => {
        if (cellObj.player === player) {
            return cellObj.position
        }
    });
    const isWinnableGame = playedCells.length >= 4;
    
    const gameStatus = {
        hasFinishedGame: gameplay.board.every(cellObj => cellObj.played),
        hasWinner: false,
        cells: cellElements // remove?
    };

    if (isWinnableGame) {
        winningPositions.some(positions => {
            const hasWinningPositions = positions.every(position =>
                currentPlayerPositions.includes(position)
            )

            if (hasWinningPositions) {
                gameStatus.hasWinner = true;
                gameStatus.winner = (gameplay.currentPlayer) ? "human" : "computer";
                gameStatus.hasFinishedGame = true;
                gameStatus.isWinnableGame = false;
                gameStatus.positions = positions;
                gameStatus.player = player;
                return true;
            }
        })
    }

    return gameStatus;
}

function showResults(hasWinner, winner, positions) {
    if (hasWinner) {
        const winnerPositions = positions.map(position => cellElements[position])
        winnerPositions.forEach(winnerPosition => winnerPosition.style.backgroundColor = "hsl(0, 0%, 20%)")
        messageElement.textContent = `${winner[0].toUpperCase() + winner.slice(1)} has won!`;
    } else {
        messageElement.textContent = "It's a tie";
    }

    setTimeout(resetGame, 2000)
}

export default startGame
export { startElement }