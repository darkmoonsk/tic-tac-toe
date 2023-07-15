class Player {
    constructor(symbol) {
        this.symbol = symbol;
        this.human = true;
    }
}

class PlayerAI {
    constructor(symbol) {
        this.symbol = symbol;
        this.human = false;
    }

    play(board) {
        const line = this.#random(1, board.length);
        const column = this.#random(1, board.length);
        console.log("AI:line", line, "AI: Column", column);
        return new PlayerMove(line, column);
    }

    #random(min, max) {
        const value = Math.random() * (max - min + 1) + min;
        return Math.floor(value);
    }
}

class PlayerMove {
    constructor(line, column) {
        this.line = line;
        this.column = column;
    }

    get valid() {
        return this.line > 0 && this.column > 0;
    }
}

class TicTacToe {
    constructor(boardSize = 3, player1 = new Player("X"), player2 = new Player("O")) {
        this.player1 = player1;
        this.player2 = player2;
        this.boardSize = boardSize;
        this.reset();
    }

    #initializeBoard() {
        return Array(this.boardSize)
            .fill(0)
            .map(() => Array(this.boardSize).fill(null));
    }

    #changePlayer() {
        this.currentPlayer =
            this.currentPlayer.symbol === this.player1.symbol ? this.player2 : this.player1;
    }

    #addPlay(playerMove) {
        let { line, column } = playerMove;
        this.board[line - 1][column - 1] = this.currentPlayer.symbol;
    }

    #validPlay(playerMove) {
        if (!playerMove.valid) {
            return false;
        }

        const { line, column } = playerMove;

        if (line > this.boardSize || column > this.boardSize) {
            return false;
        }

        if (!this.#isEmptyField(playerMove)) {
            return false;
        }
        if (this.winner) {
            return false;
        }

        return true;
    }

    #isEmptyField(playerMove) {
        const { line, column } = playerMove;
        return this.#field(line, column) === null;
    }

    #field(line, column) {
        return this.board[line - 1][column - 1];
    }

    play(playerMove) {
        if (this.currentPlayer.human) {
            this.#processPlay(playerMove);
        }
        while (!this.winner && !this.currentPlayer.human) {
            console.log("Estou aqui");
            const move = this.currentPlayer.play(this.board);
            this.#processPlay(move);
        }
    }

    #processPlay(playerMove) {
        if (!this.#validPlay(playerMove)) return;

        this.#addPlay(playerMove);
        if (this.#achievedVictoryWithMove(playerMove)) {
            this.winner = this.currentPlayer.symbol;
            return;
        } else if (this.#endedInDraw()) {
            this.winner = "-";
            return;
        }
        this.#changePlayer();
    }

    #endedInDraw() {
        const emptyFields = this.board.flat().filter((field) => field === null);
        return emptyFields.length === 0;
    }

    #achievedVictoryWithMove(playerMove) {
        const { line, column } = playerMove;
        const { board, currentPlayer } = this;
        const size = board.length;
        let indexes = Array(size)
            .fill(0)
            .map((_, i) => i + 1);
        let winOnLine = indexes.every((i) => this.#field(line, i) === currentPlayer.symbol);
        let winOnColumn = indexes.every((i) => this.#field(i, column) === currentPlayer.symbol);
        let winOnDiagonal = indexes.every((i) => this.#field(i, i) === currentPlayer.symbol);
        let winOnReverseDiagonal = indexes.every(
            (i) => this.#field(size - i + 1, i) === currentPlayer.symbol
        );

        return winOnLine || winOnColumn || winOnDiagonal || winOnReverseDiagonal;
    }

    reset() {
        this.board = this.#initializeBoard();
        this.currentPlayer = this.player1;
        this.winner = null;
    }

    toString() {
        let matrix = this.board
            .map((line) => line.map((position) => position ?? "-").join(" "))
            .join("\n");
        const winner = this.winner ? `vencedor: ${this.winner}` : "";
        return `${matrix} ${winner}`;
    }

    status() {
        if (this.winner === "-") {
            return "EMPATE!!!";
        } else if (this.winner) {
            return `${this.winner} venceu!!!`;
        } else {
            return `É a vez ${this.currentPlayer.symbol}  de jogar`;
        }
    }
}

class TicTacToeDOM {
    constructor(board, infos) {
        this.board = board;
        this.infos = infos;
    }

    initiliaze(game) {
        this.game = game;
        this.#createBoard();
        this.#makeBoardPlayable();
    }

    #makeBoardPlayable() {
        const positions = document.querySelectorAll(".position");
        for (const position of positions) {
            position.addEventListener("click", (e) => {
                const selectedPosition = e.target.attributes;
                const line = Number(selectedPosition.line.value);
                const column = Number(selectedPosition.column.value);

                console.log(`Cliquei em ${line} ${column}`);
                this.game.play(new PlayerMove(line, column));
                this.infos.innerText = this.game.status();
                console.log(this.game.toString());
                this.#printSymbols();
            });
        }
    }

    #printSymbols() {
        const positions = document.querySelectorAll(".position");
        for (const position of positions) {
            const line = Number(position.attributes.line.value);
            const column = Number(position.attributes.column.value);
            const symbol = this.game.board[line - 1][column - 1];
            position.innerHTML = symbol ?? "";
        }
    }

    #createBoard() {
        const size = this.game.boardSize;
        const positions = [];
        for (let line = 1; line <= size; line++) {
            for (let column = 1; column <= size; column++) {
                let classes = "position ";
                if (line === 1) {
                    classes += "position-top ";
                } else if (line === size) {
                    classes += "position-bottom ";
                }

                if (column === 1) {
                    classes += "position-left ";
                } else if (column === size) {
                    classes += "position-right ";
                }
                positions.push(`<div class="${classes}" line="${line}" column="${column}"></div>`);
            }
        }
        this.board.innerHTML = [...positions].join("");
        this.board.style.gridTemplateColumns = `repeat(${size}, 1fr)`
    }

    reset() {
        this.game.reset();
        const positions = document.querySelectorAll(".position");
        [...positions].forEach((position) => (position.innerHTML = ""));
        this.infos.innerText = this.game.status();
    }
}

(function () {
    const btnStart = document.querySelector("#start");
    const infos = document.querySelector("#infos");
    const board = document.querySelector("#board");
    const inputBoardSize = document.querySelector("#board-size");
    
    
    const gameDOM = new TicTacToeDOM(board, infos);
    
    function newGame(boardSize) {
        const game = new TicTacToe(boardSize, new Player("X"), new PlayerAI("O"));
        return game;
    }

    btnStart.addEventListener("click", () => {
        gameDOM.reset();
    });

    inputBoardSize.addEventListener("input", () => {
        let boardSize = +inputBoardSize.value;
        gameDOM.initiliaze(newGame(boardSize));
    })

    gameDOM.initiliaze(newGame());
})();
